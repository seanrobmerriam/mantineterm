import '@mantine/core/styles.css';

import { NavbarSegmented } from '@components/NavbarSegmented';
import { TerminalPanel } from '@components/TerminalPanel';
import { AppShell, Burger, MantineProvider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import './styles.css';

export default function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider>
      <AppShell
        padding="md"
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
      >
        <AppShell.Header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            paddingInline: 16,
          }}
        >
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>Logo</div>
        </AppShell.Header>

        <AppShell.Navbar>
          <NavbarSegmented />
        </AppShell.Navbar>

        <AppShell.Main style={{ position: 'relative', minHeight: 0 }}>
          <TerminalPanel />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
