import os

# Path to your folder
folder_path = r"asl_gifs"

# Loop through all files in the folder
for filename in os.listdir(folder_path):
    # Process only .gif files
    if filename.lower().endswith(".gif"):
        name_part, ext = os.path.splitext(filename)
        new_name = f"{name_part.upper()}{ext.lower()}"
        
        # Full old and new paths
        old_path = os.path.join(folder_path, filename)
        new_path = os.path.join(folder_path, new_name)
        
        # Rename only if different
        if old_path != new_path:
            os.rename(old_path, new_path)
            print(f"Renamed: {filename} → {new_name}")

print("✅ All GIF names converted to uppercase (extension kept lowercase)")
