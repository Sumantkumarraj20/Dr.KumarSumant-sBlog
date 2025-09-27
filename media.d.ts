import { Command, Editor } from '@tiptap/react'

declare module '@tiptap/react' {
  interface Commands {
    uploadImage: {
      uploadImage: (props: { file: File }) => ReturnType<Command>
    }
    uploadVideo: {
      uploadVideo: (props: { file: File }) => ReturnType<Command>
    }
    uploadAudio: {
      uploadAudio: (props: { file: File }) => ReturnType<Command>
    }
  }
}
