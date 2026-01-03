# Media Upload Guide

This guide explains how to add images and videos to your personal website.

## Directory Structure

Media files are organized by category:

```
public/
├── illustrations/      # SVG illustrations
├── images/
│   ├── moving/        # Images for Moving & Life stories
│   ├── career/        # Images for Career stories
│   └── learning/      # Images for Learning stories
└── videos/
    ├── moving/        # Videos for Moving & Life stories
    ├── career/        # Videos for Career stories
    └── learning/      # Videos for Learning stories
```

## Adding Images

### 1. Prepare Your Image

**Recommended sizes:**
- Full-width images: 1440px wide (for retina displays)
- Inline images: 800px wide
- Thumbnails: 400px wide

**Supported formats:**
- JPG/JPEG (best for photos)
- PNG (best for graphics with transparency)
- WebP (modern, optimized format)

### 2. Name Your Image

Use descriptive kebab-case names:
- ✅ Good: `chiang-mai-sunset.jpg`, `family-photo-2024.jpg`
- ❌ Bad: `IMG_1234.jpg`, `photo.jpg`

### 3. Upload to the Right Folder

Place your image in the appropriate category folder:
- Moving/Life stories → `public/images/moving/`
- Career stories → `public/images/career/`
- Learning stories → `public/images/learning/`

### 4. Add to Your Page

Use the `MediaGallery` component:

```astro
import MediaGallery from '../components/MediaGallery.astro';

<MediaGallery
  images={[
    {
      src: '/images/moving/chiang-mai-sunset.jpg',
      alt: 'Beautiful sunset view in Chiang Mai',
      caption: 'Our new home in Chiang Mai'
    },
    {
      src: '/images/moving/family-photo.jpg',
      alt: 'Family photo with twin boys',
      caption: 'Starting our new adventure'
    }
  ]}
  layout="grid"
/>
```

**Layout options:**
- `grid` - Multiple images in a responsive grid (default)
- `single` - Images stacked vertically, full width

## Adding Videos

### Option 1: Local Video Files

**1. Prepare your video:**
- Format: MP4 (H.264 codec for best compatibility)
- Keep file size under 50MB for web delivery
- Recommended resolution: 1080p or lower

**2. Upload to folder:**
Place in the appropriate category folder:
- `public/videos/moving/`
- `public/videos/career/`
- `public/videos/learning/`

**3. Add to your page:**

```astro
<MediaGallery
  videos={[
    {
      src: '/videos/moving/chiang-mai-tour.mp4',
      type: 'local',
      caption: 'A tour of our new neighborhood'
    }
  ]}
/>
```

### Option 2: Embedded Videos (Twitter, YouTube)

**Twitter/X Embed:**

```astro
<MediaGallery
  videos={[
    {
      src: '<blockquote class="twitter-tweet"><a href="https://x.com/jingyuan_521/status/..."></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>',
      type: 'embed',
      caption: 'My journey to Chiang Mai'
    }
  ]}
/>
```

**YouTube Embed:**

```astro
<MediaGallery
  videos={[
    {
      src: '<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>',
      type: 'embed',
      caption: 'Day in the life vlog'
    }
  ]}
/>
```

## Combining Images and Videos

You can display both images and videos together:

```astro
<MediaGallery
  images={[
    { src: '/images/career/workspace.jpg', alt: 'My workspace' }
  ]}
  videos={[
    { src: '/videos/career/content-creation.mp4', type: 'local' }
  ]}
  layout="grid"
/>
```

## Tips for Best Results

1. **Optimize before uploading**: Compress images to reduce file size without losing quality
2. **Use descriptive alt text**: Important for accessibility and SEO
3. **Add captions**: Help tell the story behind each image/video
4. **Test on mobile**: Make sure your media looks good on small screens
5. **Keep it relevant**: Only add media that enhances your story

## Need Help?

If you encounter issues with media not displaying:
1. Check that the file path is correct (starts with `/images/` or `/videos/`)
2. Verify the file exists in the `public/` directory
3. Make sure the file name matches exactly (case-sensitive)
4. Check browser console for errors

Happy creating! 🎨
