import { describe, it, expect } from 'vitest';
import { SystemPromptBuilder } from '../src/services/ai/prompt/system';
import { ProjectPromptFormatter } from '../src/services/ai/prompt/project';
import { ConversationPromptFormatter } from '../src/services/ai/prompt/conversation';
import { MessagePromptFormatter } from '../src/services/ai/prompt/messages';
import { ContextTokenizer } from '../src/services/ai/tokenizer';
import { PromptBuilder } from '../src/services/ai/prompt-builder';
import { MessageRole, Project, Conversation, Message } from '@prisma/client';

describe('Context Builder Module', () => {
  const dummyProject: Project = {
    id: 'proj-123',
    name: 'Smart Home Automation',
    description: 'Control living room and kitchen IoT devices',
    color: '#3b82f6',
    icon: 'home',
    isArchived: false,
    ownerId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummyConversation: Conversation = {
    id: 'conv-456',
    title: 'Evening Lights Routine',
    projectId: 'proj-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummyMessages: Message[] = [
    {
      id: 'msg-1',
      role: MessageRole.USER,
      content: 'Turn on the living room lights',
      metadata: null,
      conversationId: 'conv-456',
      createdAt: new Date('2026-07-24T10:00:00Z'),
      updatedAt: new Date('2026-07-24T10:00:00Z'),
    },
    {
      id: 'msg-2',
      role: MessageRole.ASSISTANT,
      content: 'I have turned on the living room lights.',
      metadata: null,
      conversationId: 'conv-456',
      createdAt: new Date('2026-07-24T10:00:05Z'),
      updatedAt: new Date('2026-07-24T10:00:05Z'),
    },
  ];

  it('should format project workspace context', () => {
    const formatted = ProjectPromptFormatter.formatProjectContext(dummyProject);
    expect(formatted).toContain('Smart Home Automation');
    expect(formatted).toContain('Control living room and kitchen IoT devices');
  });

  it('should format conversation context', () => {
    const formatted = ConversationPromptFormatter.formatConversationContext(dummyConversation);
    expect(formatted).toContain('Evening Lights Routine');
  });

  it('should format messages in chronological order and map roles correctly', () => {
    const reverseMessages = [...dummyMessages].reverse();
    const formatted = MessagePromptFormatter.formatMessages(reverseMessages);

    expect(formatted[0].role).toBe('user');
    expect(formatted[0].content).toBe('Turn on the living room lights');
    expect(formatted[1].role).toBe('assistant');
    expect(formatted[1].content).toBe('I have turned on the living room lights.');
  });

  it('should build system prompt with identity, project, and conversation context', () => {
    const systemPrompt = SystemPromptBuilder.buildSystemPrompt({
      project: dummyProject,
      conversation: dummyConversation,
    });

    expect(systemPrompt).toContain('HiMe OS Assistant');
    expect(systemPrompt).toContain('Smart Home Automation');
    expect(systemPrompt).toContain('Evening Lights Routine');
  });

  it('should support memory injection placeholder in system prompt', () => {
    const systemPrompt = SystemPromptBuilder.buildSystemPrompt({
      project: dummyProject,
      conversation: dummyConversation,
      memoriesContext: 'Memory: User prefers warm 2700K lighting in the evening.',
    });

    expect(systemPrompt).toContain('RELEVANT PROJECT MEMORIES');
    expect(systemPrompt).toContain('User prefers warm 2700K lighting in the evening.');
  });

  it('should trim long conversation history exceeding maxMessages limit', () => {
    const manyMessages: Message[] = Array.from({ length: 30 }, (_, i) => ({
      id: `msg-${i}`,
      role: i % 2 === 0 ? MessageRole.USER : MessageRole.ASSISTANT,
      content: `Message content number ${i}`,
      metadata: null,
      conversationId: 'conv-456',
      createdAt: new Date(Date.now() + i * 1000),
      updatedAt: new Date(Date.now() + i * 1000),
    }));

    const formatted = MessagePromptFormatter.formatMessages(manyMessages);
    const { messages, trimmedCount } = ContextTokenizer.trimHistory(formatted, { maxMessages: 10 });

    expect(messages.length).toBe(10);
    expect(trimmedCount).toBe(20);
    expect(messages[messages.length - 1].content).toBe('Message content number 29');
  });

  it('should trim long conversation history exceeding maxContextLength limit', () => {
    const longContent = 'A'.repeat(500);
    const longMessages: Message[] = Array.from({ length: 10 }, (_, i) => ({
      id: `msg-${i}`,
      role: MessageRole.USER,
      content: `${longContent} ${i}`,
      metadata: null,
      conversationId: 'conv-456',
      createdAt: new Date(Date.now() + i * 1000),
      updatedAt: new Date(Date.now() + i * 1000),
    }));

    const formatted = MessagePromptFormatter.formatMessages(longMessages);
    const { messages, trimmedCount } = ContextTokenizer.trimHistory(formatted, {
      maxMessages: 20,
      maxContextLength: 1200,
    });

    expect(messages.length).toBeLessThan(10);
    expect(trimmedCount).toBeGreaterThan(0);
  });

  it('should build a normalized prompt package with metadata for empty conversation', () => {
    const prompt = PromptBuilder.build({
      project: dummyProject,
      conversation: dummyConversation,
      messages: [],
      currentUserMessage: 'Hello, are you online?',
    });

    expect(prompt.systemPrompt).toContain('HiMe OS Assistant');
    expect(prompt.messages[0].role).toBe('system');
    expect(prompt.messages[1].role).toBe('user');
    expect(prompt.messages[1].content).toBe('Hello, are you online?');
    expect(prompt.metadata.projectId).toBe('proj-123');
    expect(prompt.metadata.conversationId).toBe('conv-456');
    expect(prompt.metadata.trimmedMessagesCount).toBe(0);
  });
});
