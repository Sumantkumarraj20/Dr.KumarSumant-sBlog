import { VStack, Button } from "@chakra-ui/react";
import {
  BookOpenIcon,
  ChartBarIcon, UserGroupIcon
} from "@heroicons/react/24/outline";

export default function Sidebar({
  section,
  setSection,
}: {
  section: "courses" | "users" | "analytics";
  setSection: React.Dispatch<
    React.SetStateAction<"courses" | "users" | "analytics">
  >;
}) {
  return (
    <VStack align="stretch" spacing={2}>
      <Button
        variant={section === "courses" ? "solid" : "ghost"}
        onClick={() => setSection("courses")}
        leftIcon={<BookOpenIcon />}
      >
        Learning Modules
      </Button>
      <Button
        variant={section === "users" ? "solid" : "ghost"}
        onClick={() => setSection("users")}
        leftIcon={<UserGroupIcon />}
      >
        User Management
      </Button>
      <Button
        variant={section === "analytics" ? "solid" : "ghost"}
        onClick={() => setSection("analytics")}
        leftIcon={<ChartBarIcon />}
      >
        Analytics
      </Button>
    </VStack>
  );
}
