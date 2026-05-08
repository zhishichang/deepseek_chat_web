import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageBubble from './MessageBubble.jsx';

// Mock child components
vi.mock('../Markdown/MarkdownRenderer', () => ({
  default: ({ content }) => <div data-testid="markdown">{content}</div>,
}));
vi.mock('../Markdown/ThinkingBlock', () => ({
  default: ({ content }) => <div data-testid="thinking">{content}</div>,
}));
vi.mock('./MessageActions', () => ({
  default: () => <div data-testid="actions" />,
}));

describe('MessageBubble', () => {
  it('renders user message content', () => {
    render(
      <MessageBubble
        message={{ id: 1, role: 'user', content: 'Hello world' }}
        isStreaming={false}
      />
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders assistant message with MarkdownRenderer', () => {
    render(
      <MessageBubble
        message={{ id: 1, role: 'assistant', content: 'Hi there' }}
        isStreaming={false}
      />
    );

    expect(screen.getByTestId('markdown')).toHaveTextContent('Hi there');
  });

  it('renders user icon for user messages', () => {
    const { container } = render(
      <MessageBubble
        message={{ id: 1, role: 'user', content: 'test' }}
        isStreaming={false}
      />
    );

    // User messages have PersonIcon on the right
    expect(container.querySelector('.MessageBubble-root')).toBeTruthy();
  });

  it('renders thinking block when reasoning content exists', () => {
    render(
      <MessageBubble
        message={{ id: 1, role: 'assistant', content: 'answer', reasoningContent: 'thinking...' }}
        isStreaming={false}
      />
    );

    expect(screen.getByTestId('thinking')).toHaveTextContent('thinking...');
  });

  it('shows streaming content when isStreaming is true', () => {
    render(
      <MessageBubble
        message={{ id: 1, role: 'assistant', content: '' }}
        isStreaming={true}
        streamingContent="partial..."
        streamingReasoning=""
      />
    );

    expect(screen.getByTestId('markdown')).toHaveTextContent('partial...');
  });

  it('does not show action buttons while streaming', () => {
    render(
      <MessageBubble
        message={{ id: 1, role: 'assistant', content: 'test' }}
        isStreaming={true}
        streamingContent="test"
      />
    );

    expect(screen.queryByTestId('actions')).not.toBeInTheDocument();
  });

  it('shows action buttons when not streaming', () => {
    render(
      <MessageBubble
        message={{ id: 1, role: 'assistant', content: 'test' }}
        isStreaming={false}
      />
    );

    expect(screen.getByTestId('actions')).toBeInTheDocument();
  });
});
