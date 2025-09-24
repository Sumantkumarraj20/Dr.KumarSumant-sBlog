import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

interface BreadcrumbNavProps {
  path: { label: string; onClick?: () => void }[];
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ path }) => {
  return (
    <Breadcrumb
      spacing="8px"
      separator={<ChevronDoubleRightIcon color="gray.400" />}
      fontSize="sm"
      mb={6}
    >
      {path.map((crumb, index) => (
        <BreadcrumbItem key={index} isCurrentPage={index === path.length - 1}>
          <BreadcrumbLink
            onClick={crumb.onClick}
            fontWeight={index === path.length - 1 ? "bold" : "normal"}
            _hover={{ textDecoration: crumb.onClick ? "underline" : "none" }}
            cursor={crumb.onClick ? "pointer" : "default"}
          >
            {crumb.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};
