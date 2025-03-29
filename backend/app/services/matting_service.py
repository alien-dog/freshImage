from PIL import Image
import os

def process_image(input_path, output_path):
    """
    Process the image by removing the background.
    This is a simplified version that would normally use ML or external APIs.
    
    Args:
        input_path (str): Path to the input image
        output_path (str): Path to save the processed image
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # In a real application, this would use ML models or external APIs for image matting
        # For this example, we'll simulate the process by creating a transparent version
        
        # Open the image
        img = Image.open(input_path)
        
        # Convert to RGBA (add alpha channel)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # In a real implementation, this would be replaced with actual background removal algorithm
        # For demonstration purposes, just make a simple modification
        # Create a simple circular mask
        width, height = img.size
        center_x, center_y = width // 2, height // 2
        radius = min(width, height) // 2
        
        # Apply the mask
        pixels = img.load()
        for y in range(height):
            for x in range(width):
                dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                if dist > radius:
                    # Make background transparent
                    r, g, b, a = pixels[x, y]
                    pixels[x, y] = (r, g, b, 0)
        
        # Save the processed image
        img.save(output_path, format='PNG')
        
        return True
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return False 