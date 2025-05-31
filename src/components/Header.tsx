import { Menu, Button, Avatar, Text, TextInput, Indicator, ActionIcon, Group, Box } from '@mantine/core';
import { IconSearch, IconBell, IconChevronDown, IconUser, IconSettings, IconLogout } from '@tabler/icons-react';

interface HeaderProps {
  onMenuToggle: () => void;
  onProfileAction?: (action: string) => void;
}

const Header = ({ onMenuToggle, onProfileAction }: HeaderProps) => {
  const handleDropdownItemClick = (action: string) => {
    if (onProfileAction) {
      onProfileAction(action);
    }
  };

  return (
    <Box component="header" className="bg-white shadow-sm border-b px-6 py-3">
      <Group justify="space-between">
        <Group>
          <ActionIcon variant="subtle" onClick={onMenuToggle}>
            <Text size="lg">☰</Text>
          </ActionIcon>
        </Group>
        
        <Group>
          {/* Search Bar */}
          <TextInput
            placeholder="Search here"
            leftSection={<IconSearch size={16} />}
            w={320}
          />
          
          {/* Notification */}
          <Indicator inline label="3" size={16} color="cyan">
            <ActionIcon variant="subtle" size="lg">
              <IconBell size={20} />
            </ActionIcon>
          </Indicator>
          
          {/* Profile with Dropdown */}
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="subtle" leftSection={<Avatar src="/api/placeholder/32/32" size={32} />} rightSection={<IconChevronDown size={16} />}>
                <Text>Ryan Taylor</Text>
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>
                <Group>
                  <Avatar src="/api/placeholder/40/40" size={40} />
                  <div>
                    <Text fw={500}>Ryan Taylor</Text>
                    <Text size="sm" c="dimmed">Administrator</Text>
                  </div>
                </Group>
              </Menu.Label>
              
              <Menu.Divider />
              
              <Menu.Item
                leftSection={<IconUser size={14} />}
                onClick={() => handleDropdownItemClick('profile')}
              >
                My Profile
              </Menu.Item>
              
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => handleDropdownItemClick('settings')}
              >
                Settings
              </Menu.Item>
              
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={() => handleDropdownItemClick('logout')}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Box>
  );
};

export default Header;
