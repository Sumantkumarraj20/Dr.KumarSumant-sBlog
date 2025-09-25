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
import { createUnit, updateUnit } from "@/lib/adminApi";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  unit?: { id: string; title: string; description?: string } | null;
  refresh: () => void;
}

export default function UnitModal({
  isOpen,
  onClose,
  moduleId,
  unit,
  refresh,
}: UnitModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (unit) {
      setTitle(unit.title || "");
      setDescription(unit.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [unit, isOpen]);

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
      if (unit) {
        await updateUnit(unit.id, { title, description });
        toast({ title: "Unit updated", status: "success" });
      } else {
        await createUnit({ title, description, module_id: moduleId });
        toast({ title: "Unit created", status: "success" });
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
        <ModalHeader>{unit ? "Edit Unit" : "Add Unit"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4} isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter unit title"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter unit description"
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
