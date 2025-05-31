import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Container, Title, SimpleGrid, Paper, Text, Group, ThemeIcon, Box } from '@mantine/core';
import { IconUserCheck, IconUsers, IconCalendar, IconCurrencyDollar } from '@tabler/icons-react';
import Sidebar from './Sidebar';
import Header from './Header';
import Profile from './Profile';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleMenuClick = (item: any) => {
    if (item.id === 'logout') {
      handleLogout();
    } else {
      setActiveMenu(item.label);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleProfileAction = (action: string) => {
    switch (action) {
      case 'profile':
        setActiveMenu('Profile');
        break;
      case 'settings':
        setActiveMenu('Settings');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'Profile':
        return <Profile />;
      case 'Settings':
        return (
          <Container p="xl">
            <Title order={2} mb="xl">Settings</Title>
            <Paper p="xl" withBorder>
              <Text c="dimmed">Settings page content goes here...</Text>
            </Paper>
          </Container>
        );
      default:
        return (
          <Container p="xl">
            <Title order={2} mb="xl">Dashboard</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {/* Stats Cards */}
              <Paper p="xl" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm">Total Doctors</Text>
                    <Text fw={700} size="xl">145</Text>
                  </div>
                  <ThemeIcon size="xl" variant="light" color="blue">
                    <IconUserCheck size={24} />
                  </ThemeIcon>
                </Group>
              </Paper>
              
              <Paper p="xl" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm">Total Patients</Text>
                    <Text fw={700} size="xl">1,245</Text>
                  </div>
                  <ThemeIcon size="xl" variant="light" color="green">
                    <IconUsers size={24} />
                  </ThemeIcon>
                </Group>
              </Paper>
              
              <Paper p="xl" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm">Appointments</Text>
                    <Text fw={700} size="xl">87</Text>
                  </div>
                  <ThemeIcon size="xl" variant="light" color="yellow">
                    <IconCalendar size={24} />
                  </ThemeIcon>
                </Group>
              </Paper>
              
              <Paper p="xl" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm">Revenue</Text>
                    <Text fw={700} size="xl">$25,890</Text>
                  </div>
                  <ThemeIcon size="xl" variant="light" color="violet">
                    <IconCurrencyDollar size={24} />
                  </ThemeIcon>
                </Group>
              </Paper>
            </SimpleGrid>

            {/* Add more content to test scrolling */}
            <Box mt="xl">
              {[...Array(10)].map((_, index) => (
                <Paper key={index} p="xl" withBorder mb="lg">
                  <Title order={3} mb="md">Content Section {index + 1}</Title>
                  <Text c="dimmed">
                    This is sample content to demonstrate scrolling. Lorem ipsum dolor sit amet, 
                    consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et 
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </Text>
                </Paper>
              ))}
            </Box>
          </Container>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick} 
        isCollapsed={isCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuToggle={toggleSidebar} onProfileAction={handleProfileAction} />

        {/* Content Area - This is where scrolling happens */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;