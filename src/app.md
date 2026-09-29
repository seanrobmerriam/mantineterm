import {
  AppShell,
  MantineProvider,
  Navbar,
  ScrollArea
} from "@mantine/core";
import "./styles.css"; // apply "body {overflow: hidden;}" to hide browser scrollbars
import { useViewportSize } from "@mantine/hooks";
import { NavbarSegmented } from "@components/NavbarSegmented/NavbarSegmented";

export default function App() {

  const mainContentPadding = 16;
  const viewport = useViewportSize();

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
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />

        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar>
        <NavbarSegmented />
      </AppShell.Navbar>

      <AppShell.Main>Main</AppShell.Main>
    </AppShell>
    </MantineProvider>
  );
}
