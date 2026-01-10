/**
 * Execute a command in the system terminal
 */
export async function executeInTerminal(command: string, terminal?: string): Promise<void> {
  console.log('Executing command:', command, 'in terminal:', terminal || 'default');

  if (window.__TAURI__) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('execute_in_terminal', { 
      command, 
      terminal: terminal || null 
    });
  } else {
    console.log('[DEV] Would execute in terminal:', command, 'using:', terminal || 'default');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Open a folder in the system file explorer
 */
export async function openInExplorer(path: string): Promise<void> {
  if (window.__TAURI__) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('open_in_explorer', { path });
  } else {
    console.log('[DEV] Would open in explorer:', path);
  }
}
