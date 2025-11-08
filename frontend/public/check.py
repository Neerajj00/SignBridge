import os

# Path to your folder
folder_path = "asl_gifs"

# Output file
output_file = "gif_list.txt"

# Get all file names in the folder
files = os.listdir(folder_path)

# Filter only GIF files (optional)
gif_files = [f for f in files if f.lower().endswith(".gif")]

# Write filenames to the text file
with open(output_file, "w", encoding="utf-8") as f:
    for gif in gif_files:
        f.write(gif + "\n")

print(f"✅ Saved {len(gif_files)} GIF names to {output_file}")
