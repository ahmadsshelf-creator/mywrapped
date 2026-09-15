// Handle local file and folder imports

export async function selectMusicFolder(): Promise<FileList | null> {
  return new Promise((resolve) => {
    if (!('showDirectoryPicker' in window)) {
      // Fallback for browsers that don't support directory picker
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'audio/*';
      input.addEventListener('change', () => {
        resolve(input.files);
      });
      input.addEventListener('cancel', () => {
        resolve(null);
      });
      input.click();
      return;
    }

    // Use modern File System Access API
    (window as any)
      .showDirectoryPicker()
      .then(async (dirHandle: any) => {
        const files: File[] = [];

        async function walkDirectory(handle: any) {
          for await (const [name, entry] of handle) {
            if (entry.kind === 'file') {
              try {
                const file = await entry.getFile();
                files.push(file);
              } catch (e) {
                console.warn(`Failed to read file: ${name}`, e);
              }
            } else if (entry.kind === 'directory') {
              await walkDirectory(entry);
            }
          }
        }

        try {
          await walkDirectory(dirHandle);
          // Convert array to FileList-like object
          const dataTransfer = new DataTransfer();
          files.forEach((file) => dataTransfer.items.add(file));
          resolve(dataTransfer.files);
        } catch (e) {
          console.error('Error reading directory:', e);
          resolve(null);
        }
      })
      .catch(() => {
        resolve(null);
      });
  });
}

export async function selectMusicFiles(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'audio/*';
    input.addEventListener('change', () => {
      resolve(input.files);
    });
    input.addEventListener('cancel', () => {
      resolve(null);
    });
    input.click();
  });
}
