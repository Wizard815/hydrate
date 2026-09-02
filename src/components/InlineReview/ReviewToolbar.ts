import { MarkdownView } from 'obsidian';

export interface ReviewToolbarCallbacks {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onDone: () => void;
  onJumpToNext: () => void;
}

/**
 * Floating toolbar for review mode with bulk actions
 */
export class ReviewToolbar {
  private containerEl: HTMLElement;
  private countEl: HTMLElement;
  private callbacks: ReviewToolbarCallbacks;
  private isVisible: boolean = false;

  constructor(
    parentEl: HTMLElement,
    callbacks: ReviewToolbarCallbacks
  ) {
    this.callbacks = callbacks;
    this.containerEl = this.createToolbar(parentEl);
  }

  private createToolbar(parentEl: HTMLElement): HTMLElement {
    const toolbar = createDiv();
    toolbar.className = 'hydrate-review-toolbar';

    // Make it draggable
    toolbar.draggable = true;
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    toolbar.addEventListener('dragstart', (e) => {
      isDragging = true;
      offsetX = e.clientX - toolbar.getBoundingClientRect().left;
      offsetY = e.clientY - toolbar.getBoundingClientRect().top;
      // Use a transparent drag image
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer?.setDragImage(img, 0, 0);
    });

    toolbar.addEventListener('drag', (e) => {
      if (isDragging && e.clientX > 0 && e.clientY > 0) {
        toolbar.setCssProps({
          '--hydrate-toolbar-left': `${e.clientX - offsetX}px`,
          '--hydrate-toolbar-top': `${e.clientY - offsetY}px`,
          '--hydrate-toolbar-right': 'auto',
          '--hydrate-toolbar-bottom': 'auto',
        });
      }
    });

    toolbar.addEventListener('dragend', () => {
      isDragging = false;
    });

    // Header with count
    const header = createDiv();
    header.className = 'hydrate-review-toolbar-header';

    this.countEl = createSpan();
    this.countEl.className = 'hydrate-review-toolbar-count';
    // Placeholder; updateCount() is called immediately after construction.
    this.countEl.textContent = 'No changes remaining';
    header.appendChild(this.countEl);

    // Jump to next button
    const jumpBtn = createEl('button');
    jumpBtn.className = 'hydrate-review-toolbar-btn hydrate-review-jump';
    jumpBtn.setText('↓'); // Down arrow
    jumpBtn.title = 'Jump to next change';
    jumpBtn.onclick = () => this.callbacks.onJumpToNext();
    header.appendChild(jumpBtn);

    toolbar.appendChild(header);

    // Button container
    const buttons = createDiv();
    buttons.className = 'hydrate-review-toolbar-buttons';

    const acceptAllBtn = createEl('button');
    acceptAllBtn.className = 'hydrate-review-toolbar-btn hydrate-review-accept-all';
    acceptAllBtn.textContent = 'Accept all';
    acceptAllBtn.onclick = () => this.callbacks.onAcceptAll();

    const rejectAllBtn = createEl('button');
    rejectAllBtn.className = 'hydrate-review-toolbar-btn hydrate-review-reject-all';
    rejectAllBtn.textContent = 'Reject all';
    rejectAllBtn.onclick = () => this.callbacks.onRejectAll();

    const doneBtn = createEl('button');
    doneBtn.className = 'hydrate-review-toolbar-btn hydrate-review-done';
    doneBtn.textContent = 'Done';
    doneBtn.onclick = () => this.callbacks.onDone();

    buttons.appendChild(acceptAllBtn);
    buttons.appendChild(rejectAllBtn);
    buttons.appendChild(doneBtn);
    toolbar.appendChild(buttons);

    // Add to parent (hidden initially)
    toolbar.addClass('hydrate-hidden');
    parentEl.appendChild(toolbar);

    return toolbar;
  }

  /**
   * Update the change count display
   */
  public updateCount(remaining: number): void {
    const text = remaining === 1
      ? '1 change remaining'
      : `${remaining} changes remaining`;
    this.countEl.textContent = text;

    // If no changes remaining, update UI
    if (remaining === 0) {
      this.countEl.textContent = 'All changes reviewed';
    }
  }

  /**
   * Show the toolbar
   */
  public show(): void {
    this.containerEl.removeClass('hydrate-hidden');
    this.isVisible = true;
  }

  /**
   * Hide the toolbar
   */
  public hide(): void {
    this.containerEl.addClass('hydrate-hidden');
    this.isVisible = false;
  }

  /**
   * Check if toolbar is visible
   */
  public isShowing(): boolean {
    return this.isVisible;
  }

  /**
   * Destroy the toolbar and clean up
   */
  public destroy(): void {
    this.containerEl.remove();
  }

  /**
   * Reset position to default (bottom-right)
   */
  public resetPosition(): void {
    this.containerEl.setCssProps({
      '--hydrate-toolbar-left': 'auto',
      '--hydrate-toolbar-top': 'auto',
      '--hydrate-toolbar-right': '16px',
      '--hydrate-toolbar-bottom': '16px',
    });
  }
}

/**
 * Create a review toolbar attached to a MarkdownView
 */
export function createReviewToolbar(
  view: MarkdownView,
  callbacks: ReviewToolbarCallbacks
): ReviewToolbar {
  // Get the content container of the markdown view
  const contentEl = view.contentEl;
  return new ReviewToolbar(contentEl, callbacks);
}
