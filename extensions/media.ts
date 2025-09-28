import { Node, mergeAttributes, Command } from "@tiptap/core";
import { uploadToCloudinary } from "../lib/cloudinary";

// Helper function to safely execute editor commands
const safeCommand = (editor: any, command: () => void) => {
  if (!editor || !editor.view || editor.isDestroyed) {
    console.warn('Editor not available for command execution');
    return false;
  }
  
  try {
    command();
    return true;
  } catch (error) {
    console.error('Error executing editor command:', error);
    return false;
  }
};

// -------------------
// Image Node
// -------------------
export const ImageUpload = Node.create({
  name: "customImage",
  group: "block",
  inline: false,
  draggable: true,
  
  addAttributes() {
    return { 
      src: {}, 
      alt: { default: null },
      loading: { default: 'lazy' }
    };
  },
  
  parseHTML() { 
    return [{ tag: "img" }]; 
  },
  
  renderHTML({ HTMLAttributes }) { 
    return ["img", mergeAttributes(HTMLAttributes)]; 
  },
  
  addCommands() {
    return {
      uploadImage: (options: { file: File }): Command => ({ editor, chain }) => {
        if (!editor || editor.isDestroyed) {
          console.warn('Editor not available for image upload');
          return false;
        }

        // Show loading state immediately
        const placeholderId = `img-${Date.now()}`;
        chain().focus().insertContent({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `Uploading image... (${options.file.name})`
            }
          ]
        }).run();

        // Async upload
        uploadToCloudinary(options.file, "images")
          .then(url => {
            if (!editor || editor.isDestroyed) {
              console.warn('Editor destroyed during upload, skipping');
              return;
            }

            // Replace loading text with actual image
            const { state, dispatch } = editor.view;
            const { tr } = state;
            
            // Find and replace the loading text with the image
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' && 
                  node.textContent.includes('Uploading image')) {
                tr.replaceWith(pos, pos + node.nodeSize, 
                  state.schema.nodes.customImage.create({ src: url, alt: options.file.name })
                );
                dispatch(tr);
                return false; // Stop searching
              }
            });
          })
          .catch(error => {
            console.error('Image upload failed:', error);
            if (!editor || editor.isDestroyed) return;
            
            // Replace with error message
            const { state, dispatch } = editor.view;
            const { tr } = state;
            
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' && 
                  node.textContent.includes('Uploading image')) {
                tr.replaceWith(pos, pos + node.nodeSize, 
                  state.schema.nodes.paragraph.create({}, [
                    state.schema.nodes.text.create({ text: `Upload failed: ${error.message}` })
                  ])
                );
                dispatch(tr);
                return false;
              }
            });
          });

        return true;
      },
    } as unknown as Partial<Command>;
  },
});

// -------------------
// Video Node
// -------------------
export const VideoUpload = Node.create({
  name: "customVideo",
  group: "block",
  inline: false,
  draggable: true,
  
  addAttributes() {
    return { 
      src: {}, 
      controls: { default: true }, 
      autoplay: { default: false }, 
      loop: { default: false },
      muted: { default: false },
      preload: { default: 'metadata' }
    };
  },
  
  parseHTML() { 
    return [{ tag: "video" }]; 
  },
  
  renderHTML({ HTMLAttributes }) { 
    return ["video", mergeAttributes({ controls: true }, HTMLAttributes)]; 
  },
  
  addCommands() {
    return {
      uploadVideo: (options: { file: File; controls?: boolean; autoplay?: boolean; loop?: boolean }): Command => ({ editor, chain }) => {
        if (!editor || editor.isDestroyed) {
          console.warn('Editor not available for video upload');
          return false;
        }

        // Show loading state
        chain().focus().insertContent({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `Uploading video... (${options.file.name})`
            }
          ]
        }).run();

        uploadToCloudinary(options.file, "videos")
          .then(url => {
            if (!editor || editor.isDestroyed) return;

            const { state, dispatch } = editor.view;
            const { tr } = state;
            
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' && 
                  node.textContent.includes('Uploading video')) {
                tr.replaceWith(pos, pos + node.nodeSize, 
                  state.schema.nodes.customVideo.create({
                    src: url,
                    controls: options.controls ?? true,
                    autoplay: options.autoplay ?? false,
                    loop: options.loop ?? false,
                  })
                );
                dispatch(tr);
                return false;
              }
            });
          })
          .catch(error => {
            console.error('Video upload failed:', error);
            if (!editor || editor.isDestroyed) return;
            
            const { state, dispatch } = editor.view;
            const { tr } = state;
            
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' && 
                  node.textContent.includes('Uploading video')) {
                tr.replaceWith(pos, pos + node.nodeSize, 
                  state.schema.nodes.paragraph.create({}, [
                    state.schema.nodes.text.create({ text: `Video upload failed: ${error.message}` })
                  ])
                );
                dispatch(tr);
                return false;
              }
            });
          });

        return true;
      },
    } as unknown as Partial<Command>;
  },
});

// -------------------
// Audio Node
// -------------------
export const AudioUpload = Node.create({
  name: "customAudio",
  group: "block",
  inline: false,
  draggable: true,
  
  addAttributes() { 
    return { 
      src: {}, 
      controls: { default: true },
      preload: { default: 'metadata' }
    }; 
  },
  
  parseHTML() { 
    return [{ tag: "audio" }]; 
  },
  
  renderHTML({ HTMLAttributes }) { 
    return ["audio", mergeAttributes({ controls: true }, HTMLAttributes)]; 
  },
  
  addCommands() {
    return {
      uploadAudio: (options: { file: File }): Command => ({ editor, chain }) => {
        if (!editor || editor.isDestroyed) {
          console.warn('Editor not available for audio upload');
          return false;
        }

        // Show loading state
        chain().focus().insertContent({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `Uploading audio... (${options.file.name})`
            }
          ]
        }).run();

        uploadToCloudinary(options.file, "audio")
          .then(url => {
            if (!editor || editor.isDestroyed) return;

            const { state, dispatch } = editor.view;
            const { tr } = state;
            
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' && 
                  node.textContent.includes('Uploading audio')) {
                tr.replaceWith(pos, pos + node.nodeSize, 
                  state.schema.nodes.customAudio.create({ src: url })
                );
                dispatch(tr);
                return false;
              }
            });
          })
          .catch(error => {
            console.error('Audio upload failed:', error);
            if (!editor || editor.isDestroyed) return;
            
            const { state, dispatch } = editor.view;
            const { tr } = state;
            
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' && 
                  node.textContent.includes('Uploading audio')) {
                tr.replaceWith(pos, pos + node.nodeSize, 
                  state.schema.nodes.paragraph.create({}, [
                    state.schema.nodes.text.create({ text: `Audio upload failed: ${error.message}` })
                  ])
                );
                dispatch(tr);
                return false;
              }
            });
          });

        return true;
      },
    } as unknown as Partial<Command>;
  },
});