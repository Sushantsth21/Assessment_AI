import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Load environment variables
load_dotenv()

# Initialize OpenAI client (updated API)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Pinecone client
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Set your Pinecone index name
index_name = "health-assistant"

# Create index if it doesn't exist
if index_name not in pc.list_indexes().names():
    print(f"Creating new index: {index_name}")
    pc.create_index(
        name=index_name,
        dimension=1536,  # for OpenAI's embedding model
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region=os.getenv("PINECONE_ENVIRONMENT")
        )
    )
else:
    print(f"Index {index_name} already exists")

# Connect to the index
index = pc.Index(index_name)

# LangChain text splitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", "!", "?", " ", ""]
)

# Embedding function
def generate_embedding(text: str):
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

# Directory with text files
data_dir = Path("/Users/sushantshrestha/Developer/Assessment_AI/backend/data")

# Define the namespace
namespace = "diseases"

# Process each text file
total_files = len(list(data_dir.glob("*.txt")))
processed_files = 0

print(f"Found {total_files} files to process")

for file_path in data_dir.glob("*.txt"):
    processed_files += 1
    print(f"Processing file {processed_files}/{total_files}: {file_path.name}")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        if not content.strip():
            print(f"Warning: File {file_path.name} is empty, skipping.")
            continue
            
        chunks = splitter.split_text(content)
        print(f"Split {file_path.name} into {len(chunks)} chunks")
        
        # Process in smaller batches to avoid API limits
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i+batch_size]
            batch = []
            
            for j, chunk in enumerate(batch_chunks):
                chunk_idx = i + j
                try:
                    # Skip empty chunks
                    if not chunk.strip():
                        continue
                        
                    embedding = generate_embedding(chunk)
                    
                    # Create a proper vector record for Pinecone
                    vector_record = {
                        "id": f"{file_path.stem}-{chunk_idx}",
                        "values": embedding,
                        "metadata": {
                            "source_file": file_path.name,
                            "chunk_index": chunk_idx,
                            "text": chunk[:100] + "..." if len(chunk) > 100 else chunk  # Store preview of text
                        }
                    }
                    
                    batch.append(vector_record)
                    
                except Exception as e:
                    print(f"Error embedding chunk {chunk_idx} of {file_path.name}: {e}")
            
            if batch:
                try:
                    # Upsert the batch to Pinecone
                    index.upsert(vectors=batch, namespace=namespace)
                    print(f"Uploaded batch of {len(batch)} chunks from {file_path.name}")
                except Exception as e:
                    print(f"Error upserting batch from {file_path.name}: {e}")
    
    except Exception as e:
        print(f"Error processing file {file_path.name}: {e}")

# Verify data was inserted
try:
    stats = index.describe_index_stats()
    total_vectors = stats.namespaces.get(namespace, {}).get("vector_count", 0)
    print(f"\n✅ Upload complete. Total vectors in namespace '{namespace}': {total_vectors}")
except Exception as e:
    print(f"Error getting index stats: {e}")