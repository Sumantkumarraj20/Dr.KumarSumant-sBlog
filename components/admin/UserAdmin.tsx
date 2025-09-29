// components/admin/UserAdmin.tsx
"use client";

import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Tag,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Divider,
} from '@chakra-ui/react';
import {
  FiMail,
  FiUser,
  FiMessageSquare,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiEye,
  FiTrash2,
  FiRefreshCw,
  FiChevronDown,
  FiStar,
  FiArchive,
} from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/authContext';
import { format, formatDistanceToNow } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  user_id?: string;
  status: 'new' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high';
}

interface UserAdminProps {
  initialMessages?: ContactMessage[];
}

const UserAdmin: React.FC<UserAdminProps> = ({ initialMessages = [] }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance messages with status and priority
      const enhancedMessages: ContactMessage[] = (data || []).map(msg => ({
        ...msg,
        status: 'new' as const, // You might want to store this in your database
        priority: determinePriority(msg.message, msg.created_at),
      }));

      setMessages(enhancedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const determinePriority = (message: string, createdAt: string): 'low' | 'medium' | 'high' => {
    const messageLength = message.length;
    const isRecent = new Date(createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (messageLength > 500 && isRecent) return 'high';
    if (messageLength > 200 || isRecent) return 'medium';
    return 'low';
  };

  const updateMessageStatus = async (messageId: string, status: ContactMessage['status']) => {
    try {
      // In a real implementation, you'd update this in the database
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'read': return 'green';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };

  const openMessageDetail = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      updateMessageStatus(message.id, 'read');
    }
    onOpen();
  };

  useEffect(() => {
    loadMessages();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading messages...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box p={6} maxW="1400px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={2}>
          <Heading size="xl" bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text">
            Contact Messages
          </Heading>
          <Text color="gray.600">
            Manage and respond to user inquiries and feedback
          </Text>
        </VStack>

        <HStack spacing={4}>
          <Button
            leftIcon={<FiRefreshCw />}
            onClick={loadMessages}
            variant="outline"
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={2}>
              <Badge colorScheme="blue" fontSize="sm">Total Messages</Badge>
              <Heading size="2xl">{messages.length}</Heading>
              <Text color="gray.600">All inquiries</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={2}>
              <Badge colorScheme="green" fontSize="sm">New</Badge>
              <Heading size="2xl">
                {messages.filter(m => m.status === 'new').length}
              </Heading>
              <Text color="gray.600">Require attention</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={2}>
              <Badge colorScheme="orange" fontSize="sm">High Priority</Badge>
              <Heading size="2xl">
                {messages.filter(m => m.priority === 'high').length}
              </Heading>
              <Text color="gray.600">Urgent matters</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={2}>
              <Badge colorScheme="purple" fontSize="sm">This Week</Badge>
              <Heading size="2xl">
                {messages.filter(m => 
                  new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </Heading>
              <Text color="gray.600">Recent activity</Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters and Search */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
        <CardBody>
          <Flex gap={4} wrap="wrap">
            <InputGroup flex="1" minW="200px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Menu>
              <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                Status: {statusFilter === 'all' ? 'All' : statusFilter}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setStatusFilter('all')}>All Status</MenuItem>
                <MenuItem onClick={() => setStatusFilter('new')}>New</MenuItem>
                <MenuItem onClick={() => setStatusFilter('read')}>Read</MenuItem>
                <MenuItem onClick={() => setStatusFilter('archived')}>Archived</MenuItem>
              </MenuList>
            </Menu>

            <Menu>
              <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                Priority: {priorityFilter === 'all' ? 'All' : priorityFilter}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setPriorityFilter('all')}>All Priority</MenuItem>
                <MenuItem onClick={() => setPriorityFilter('high')}>High</MenuItem>
                <MenuItem onClick={() => setPriorityFilter('medium')}>Medium</MenuItem>
                <MenuItem onClick={() => setPriorityFilter('low')}>Low</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </CardBody>
      </Card>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Messages Table */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">
              Messages ({filteredMessages.length})
            </Heading>
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
              <Tr>
                <Th>From</Th>
                <Th>Message Preview</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredMessages.map((message) => (
                <Tr 
                  key={message.id} 
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                  cursor="pointer"
                  onClick={() => openMessageDetail(message)}
                >
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={message.name} />
                      <Box>
                        <Text fontWeight="medium">{message.name}</Text>
                        <Text fontSize="sm" color="gray.600">{message.email}</Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td maxW="300px">
                    <Text 
                      noOfLines={2} 
                      fontSize="sm"
                      title={message.message}
                    >
                      {message.message}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(message.status)}>
                      {message.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getPriorityColor(message.priority)}>
                      {message.priority}
                    </Badge>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm">
                        {format(new Date(message.created_at), 'MMM dd, yyyy')}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {formatDistanceToNow(new Date(message.created_at))} ago
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="View message"
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMessageDetail(message);
                        }}
                      />
                      <IconButton
                        aria-label="Delete message"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {filteredMessages.length === 0 && (
            <Box textAlign="center" py={10}>
              <FiMail size={48} color="gray" style={{ margin: '0 auto 16px' }} />
              <Text color="gray.600" fontSize="lg">No messages found</Text>
              <Text color="gray.500" mt={2}>
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'All messages are processed and archived'
                }
              </Text>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Message Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Avatar size="sm" name={selectedMessage?.name} />
              <Box>
                <Text fontWeight="medium">{selectedMessage?.name}</Text>
                <Text fontSize="sm" color="gray.600">{selectedMessage?.email}</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Badge colorScheme={getStatusColor(selectedMessage?.status || 'new')}>
                  {selectedMessage?.status}
                </Badge>
                <Badge colorScheme={getPriorityColor(selectedMessage?.priority || 'low')}>
                  {selectedMessage?.priority} priority
                </Badge>
                <Text fontSize="sm" color="gray.600">
                  {selectedMessage && format(new Date(selectedMessage.created_at), 'PPpp')}
                </Text>
              </HStack>

              <Divider />

              <Box>
                <Text fontWeight="medium" mb={2}>Message:</Text>
                <Textarea
                  value={selectedMessage?.message || ''}
                  readOnly
                  rows={8}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                />
              </Box>

              <HStack justify="space-between" pt={4}>
                <HStack>
                  <Button
                    leftIcon={<FiArchive />}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedMessage) {
                        updateMessageStatus(selectedMessage.id, 'archived');
                        onClose();
                      }
                    }}
                  >
                    Archive
                  </Button>
                  <Button
                    leftIcon={<FiMail />}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => {
                      if (selectedMessage) {
                        window.open(`mailto:${selectedMessage.email}?subject=Re: Your message&body=Dear ${selectedMessage.name},%0D%0A%0D%0A`, '_blank');
                      }
                    }}
                  >
                    Reply
                  </Button>
                </HStack>

                <Button
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  leftIcon={<FiTrash2 />}
                  onClick={() => {
                    if (selectedMessage) {
                      deleteMessage(selectedMessage.id);
                      onClose();
                    }
                  }}
                >
                  Delete
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// SimpleGrid component (add this if not available)
const SimpleGrid = ({ children, columns, spacing }: any) => (
  <Box
    display="grid"
    gridTemplateColumns={{
      base: '1fr',
      md: `repeat(${columns.md}, 1fr)`,
      lg: `repeat(${columns.lg || columns.md}, 1fr)`,
    }}
    gap={spacing}
  >
    {children}
  </Box>
);

export default UserAdmin;