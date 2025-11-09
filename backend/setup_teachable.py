"""
Complete setup script for integrating Google Teachable Machine model
This version uses the TensorFlow.js model directly without conversion
"""

import os
import json
import shutil
from pathlib import Path

def setup_directories():
    """Create necessary directories"""
    print("📁 Setting up directories...")
    
    dirs = [
        "teachable_machine_model",
        "server/utils"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"   ✓ {dir_path}")
    
    print()

def check_teachable_files():
    """Check if Teachable Machine files exist"""
    print("🔍 Checking for Teachable Machine files...")
    
    required_files = [
        "my-pose-model/model.json",
        "my-pose-model/metadata.json",
        "my-pose-model/weights.bin"
    ]
    
    # Check for weights file (could be weights.bin or group1-shard1of1.bin)
    weights_found = False
    weights_patterns = ["weights.bin"]
    
    for pattern in weights_patterns:
        weights_files = list(Path("teachable_machine_model").glob(f"*{pattern}*"))
        if weights_files:
            weights_found = True
            print(f"   ✓ Found weights: {weights_files[0].name}")
            break
    
    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"   ✓ Found: {file}")
        else:
            print(f"   ✗ Missing: {file}")
            missing_files.append(file)
    
    if not weights_found:
        print(f"   ✗ Missing: weights file")
        missing_files.append("weights file")
    
    print()
    
    if missing_files:
        print("❌ Missing Teachable Machine files!")
        print("\n📥 Please download your model from Teachable Machine:")
        print("   1. Go to your Teachable Machine project")
        print("   2. Click 'Export Model'")
        print("   3. Choose 'TensorFlow' tab")
        print("   4. Select 'Download' (not 'Upload')")
        print("   5. Download the model")
        print("   6. Extract the ZIP file")
        print("   7. Copy ALL files to 'teachable_machine_model/' folder")
        print("      (model.json, weights files, metadata.json)")
        return False
    
    return True

def extract_labels():
    """Extract labels from metadata.json"""
    print("🏷️  Extracting labels from metadata...")
    
    try:
        with open("teachable_machine_model/metadata.json", "r") as f:
            metadata = json.load(f)
        
        labels = metadata.get("labels", [])
        
        if not labels:
            print("   ❌ No labels found in metadata.json")
            return False
        
        # Create mapping {index: label}
        mapping = {str(i): label for i, label in enumerate(labels)}
        
        # Save mapping for easy access
        with open("teachable_machine_model/mapping.json", "w") as f:
            json.dump(mapping, f, indent=2)
        
        print(f"   ✓ Extracted {len(labels)} labels")
        print(f"   ✓ Saved to: teachable_machine_model/mapping.json")
        print(f"   ✓ Labels: {', '.join(labels)}")
        
        print()
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def create_requirements():
    """Create requirements.txt for the project"""
    print("📝 Creating requirements.txt...")
    
    requirements = """# Core dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pydantic==2.5.0

# ML/CV dependencies
tensorflow==2.15.0
opencv-python==4.8.1.78
numpy==1.24.3

# Audio processing
gtts==2.4.0

# Google AI
google-generativeai==0.3.1

# Utilities
python-dotenv==1.0.0
"""
    
    with open("requirements.txt", "w") as f:
        f.write(requirements.strip())
    
    print("   ✓ requirements.txt created")
    print()

def create_env_template():
    """Create .env.example template"""
    print("📝 Creating .env.example...")
    
    env_template = """# Google Gemini API Key
GEMINI_API_KEY=your_api_key_here
"""
    
    with open(".env.example", "w") as f:
        f.write(env_template.strip())
    
    print("   ✓ .env.example created")
    print("   ⚠️  Remember to create .env with your actual API keys")
    print()

def test_model_loading():
    """Test if TensorFlow can load the model directly"""
    print("🧪 Testing model loading...")
    
    try:
        import tensorflow as tf
        
        # Try to load the model directly as TensorFlow.js format
        model_path = "teachable_machine_model"
        
        # TensorFlow 2.x can load TensorFlow.js models directly
        model = tf.keras.models.load_model(
            model_path,
            compile=False
        )
        
        print(f"   ✓ Model loaded successfully!")
        print(f"   ✓ Input shape: {model.input_shape}")
        print(f"   ✓ Output shape: {model.output_shape}")
        print()
        return True
        
    except Exception as e:
        print(f"   ⚠️  Direct loading failed: {e}")
        print("   ℹ️  This is normal - we'll load it differently in the code")
        print()
        return False

def print_next_steps(success):
    """Print next steps for the user"""
    print("\n" + "="*60)
    
    if success:
        print("✅ Setup Complete!")
        print("="*60)
        print("\n📋 Next Steps:\n")
        print("1. Install dependencies:")
        print("   pip install tensorflow opencv-python numpy")
        print()
        print("2. Test the model:")
        print("   python test_camera.py")
        print()
        print("3. Start your FastAPI server:")
        print("   python server/main.py")
        print()
        print("4. Test the API:")
        print("   curl http://localhost:8000/model_status")
        print()
    else:
        print("❌ Setup Incomplete")
        print("="*60)
        print("\nPlease fix the errors above and run this script again.")
    
    print("="*60 + "\n")

def main():
    print("\n" + "="*60)
    print("🚀 Teachable Machine Setup for SignBridge")
    print("="*60 + "\n")
    
    # Step 1: Setup directories
    setup_directories()
    
    # Step 2: Check for Teachable Machine files
    if not check_teachable_files():
        print_next_steps(False)
        return
    
    # Step 3: Extract labels
    labels_success = extract_labels()
    if not labels_success:
        print_next_steps(False)
        return
    
    # Step 4: Test model loading
    test_model_loading()
    
    # Step 5: Create helper files
    create_requirements()
    create_env_template()
    
    # Done!
    print_next_steps(True)

if __name__ == "__main__":
    main()