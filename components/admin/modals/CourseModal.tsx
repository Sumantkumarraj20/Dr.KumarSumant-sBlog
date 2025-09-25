import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormLabel, Input, Textarea, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { createCourse, updateCourse } from "@/lib/adminApi";
import { Course } from "@/lib/adminApi";

export default function CourseModal({ isOpen, onClose, course, refresh }: { isOpen: boolean, onClose: () => void, course?: Course | null, refresh: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setDescription(course.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [course, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) return toast({ title: "Title is required", status: "warning" });
    setLoading(true);
    try {
      if (course) await updateCourse(course.id, { title, description });
      else await createCourse({ title, description });
      toast({ title: course ? "Updated" : "Created", status: "success" });
      refresh();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Try again", status: "error" });
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{course ? "Edit Course" : "Add Course"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={4} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={loading}>Save</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
