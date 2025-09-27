import { Node, mergeAttributes, Command } from "@tiptap/core";
import { uploadToCloudinary } from "../lib/cloudinary";

// -------------------
// Image Node
// -------------------
export const ImageUpload = Node.create({
  name: "customImage",
  group: "block",
  inline: false,
  draggable: true,
  addAttributes() {
    return { src: {}, alt: { default: null } };
  },
  parseHTML() { return [{ tag: "img" }]; },
  renderHTML({ HTMLAttributes }) { return ["img", mergeAttributes(HTMLAttributes)]; },
  addCommands() {
    const self = this;
    return {
      uploadImage: (options: { file: File }): Command => ({ editor }) => {
        // async upload
        uploadToCloudinary(options.file, "images").then(url => {
          editor.chain().focus().setNode(self.name, { src: url }).run();
        });
        return true; // must return boolean
      },
    } as unknown as Partial<Command>; // <-- TS hack for type safety
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
    return { src: {}, controls: { default: true }, autoplay: { default: false }, loop: { default: false } };
  },
  parseHTML() { return [{ tag: "video" }]; },
  renderHTML({ HTMLAttributes }) { return ["video", mergeAttributes({ controls: true }, HTMLAttributes), 0]; },
  addCommands() {
    const self = this;
    return {
      uploadVideo: (options: { file: File; controls?: boolean; autoplay?: boolean; loop?: boolean }): Command => ({ editor }) => {
        uploadToCloudinary(options.file, "videos").then(url => {
          editor.chain().focus().setNode(self.name, {
            src: url,
            controls: options.controls ?? true,
            autoplay: options.autoplay ?? false,
            loop: options.loop ?? false,
          }).run();
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
  addAttributes() { return { src: {}, controls: { default: true } }; },
  parseHTML() { return [{ tag: "audio" }]; },
  renderHTML({ HTMLAttributes }) { return ["audio", mergeAttributes({ controls: true }, HTMLAttributes), 0]; },
  addCommands() {
    const self = this;
    return {
      uploadAudio: (options: { file: File }): Command => ({ editor }) => {
        uploadToCloudinary(options.file, "audio").then(url => {
          editor.chain().focus().setNode(self.name, { src: url }).run();
        });
        return true;
      },
    } as unknown as Partial<Command>;
  },
});
