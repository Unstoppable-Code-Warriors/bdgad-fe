import { useState } from 'react';
import { Container, Title, Breadcrumbs, Anchor, Paper, Group, Avatar, Text, Button, Tabs, SimpleGrid } from '@mantine/core';
import { IconEdit, IconMapPin } from '@tabler/icons-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('about');

  const breadcrumbItems = [
    { title: 'Dashboard', href: '#' },
    { title: 'Profile', href: '#' },
  ].map((item, index) => (
    <Anchor href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container p="xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Title order={2} mb="sm">Profile</Title>
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
      </div>

      {/* Profile Header */}
      <Paper p="xl" withBorder mb="xl">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar src="/api/placeholder/80/80" size={80} radius="xl" />
            <div>
              <Title order={2}>Ryan Taylor</Title>
              <Text c="dimmed">ryantaylor@admin.com</Text>
              <Group mt="xs">
                <IconMapPin size={16} />
                <Text c="dimmed">Florida, United States</Text>
              </Group>
              <Text c="dimmed" mt="sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
                tempor incididunt ut labore et dolore magna aliqua.
              </Text>
            </div>
          </Group>
          <Button leftSection={<IconEdit size={16} />} color="cyan">
            Edit
          </Button>
        </Group>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(value) => {
            if (value !== null) setActiveTab(value);
          }}
          mt="xl"
        >
          <Tabs.List>
            <Tabs.Tab value="about">About</Tabs.Tab>
            <Tabs.Tab value="password">Password</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Paper>

      {/* Personal Details */}
      <Paper p="xl" withBorder>
        <Group justify="space-between" mb="xl">
          <Title order={3}>Personal Details</Title>
          <Button variant="subtle" leftSection={<IconEdit size={16} />} color="cyan">
            Edit
          </Button>
        </Group>

        <SimpleGrid cols={2} spacing="xl">
          <div>
            <Text size="sm" c="dimmed" mb="xs">Name</Text>
            <Text fw={500}>John Doe</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed" mb="xs">Date of Birth</Text>
            <Text fw={500}>24 Jul 1983</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed" mb="xs">Email ID</Text>
            <Text fw={500}>johndoe@example.com</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed" mb="xs">Mobile</Text>
            <Text fw={500}>305-310-5857</Text>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <Text size="sm" c="dimmed" mb="xs">Address</Text>
            <Text fw={500}>4663 Agriculture Lane</Text>
          </div>
        </SimpleGrid>
      </Paper>
    </Container>
  );
};

export default Profile;