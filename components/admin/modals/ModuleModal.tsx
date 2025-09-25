import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import { createModule, updateModule } from "@/lib/adminApi";

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  module?: { id: string; title: string; description?: string } | null;
  refresh: () => void;
}

export default function ModuleModal({
  isOpen,
  onClose,
  courseId,
  module,
  refresh,
}: ModuleModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (module) {
      setTitle(module.title || "");
      setDescription(module.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [module, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      if (module) {
        await updateModule(module.id, { title, description });
        toast({ title: "Module updated", status: "success" });
      } else {
        await createModule({ title, description, course_id: courseId });
        toast({ title: "Module created", status: "success" });
      }
      refresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Please try again.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{module ? "Edit Module" : "Add Module"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4} isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter module title"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter module description"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!title.trim()}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
