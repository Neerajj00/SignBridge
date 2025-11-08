import os
import sys
import subprocess
from pathlib import Path
import yt_dlp


def download_youtube_video(url, output_dir):
    """Download the YouTube video and return its local file path."""
    ydl_opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
        "outtmpl": str(Path(output_dir) / "%(title)s.%(ext)s"),
        "quiet": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        print(f"✅ Downloaded: {filename}")
        return filename


def convert_to_gif(video_path, output_dir, width=320, fps=15):
    """Convert a video file to a GIF using ffmpeg."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    gif_path = output_dir / (Path(video_path).stem + ".gif")

    # palette method gives better colors
    palette = output_dir / "palette.png"

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-vf", f"fps={fps},scale={width}:-1:flags=lanczos,palettegen",
            str(palette),
        ],
        check=True,
    )

    subprocess.run(
        [
            "ffmpeg",
            "-i", video_path,
            "-i", str(palette),
            "-filter_complex",
            f"fps={fps},scale={width}:-1:flags=lanczos[x];[x][1:v]paletteuse",
            "-loop", "0",
            str(gif_path),
        ],
        check=True,
    )

    palette.unlink(missing_ok=True)
    print(f"🎬 Converted to GIF: {gif_path}")

    return gif_path


def main():
    if len(sys.argv) < 2:
        print("Usage: python yt_to_gif.py <youtube_url>")
        sys.exit(1)

    url = sys.argv[1]

    # ✅ Define absolute output folder: public/asl_gifs
    project_root = Path(__file__).resolve().parent
    output_dir = project_root / "public" / "asl_gifs"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Step 1: download video temporarily (store in same folder)
    video_path = download_youtube_video(url, output_dir)

    # Step 2: convert to GIF
    gif_path = convert_to_gif(video_path, output_dir)

    # ✅ Step 3: delete the temporary video after successful conversion
    os.remove(video_path)
    print("🧹 Removed temporary video file.")

    print(f"\n✅ Done! GIF saved at: {gif_path}")



if __name__ == "__main__":
    main()
