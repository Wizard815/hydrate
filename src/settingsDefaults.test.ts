import { describe, expect, it } from "vitest";
import {
	DEFAULT_SETTINGS,
	DEFAULT_CONVERSATION_RULE,
	normalizeSettings,
} from "./settingsDefaults";

const DEFAULT_ISSUE_ENTRY_SHAPE = {
	id: "default-issue-board",
	slashCommandTrigger: "/issue",
};

describe("normalizeSettings", () => {
	it("normalizeSettings(null) deep-equals DEFAULT_SETTINGS plus injected registry/rule defaults", () => {
		const result = normalizeSettings(null);
		expect(result).toEqual({
			...DEFAULT_SETTINGS,
			registryEntries: [
				expect.objectContaining(DEFAULT_ISSUE_ENTRY_SHAPE),
			],
			rulesRegistryEntries: [DEFAULT_CONVERSATION_RULE],
		});
	});

	it("normalizeSettings(undefined) deep-equals DEFAULT_SETTINGS plus injected registry/rule defaults", () => {
		const result = normalizeSettings(undefined);
		expect(result).toEqual({
			...DEFAULT_SETTINGS,
			registryEntries: [
				expect.objectContaining(DEFAULT_ISSUE_ENTRY_SHAPE),
			],
			rulesRegistryEntries: [DEFAULT_CONVERSATION_RULE],
		});
	});

	it("migrates pre-0.1.39 installs missing enableVaultInstructions to true", () => {
		const raw = { selectedModel: "claude-sonnet-4-6" };
		const result = normalizeSettings(raw);
		expect(result.enableVaultInstructions).toBe(true);
	});

	it("migrates installs missing enableStreaming to true", () => {
		const raw = { selectedModel: "claude-sonnet-4-6" };
		const result = normalizeSettings(raw);
		expect(result.enableStreaming).toBe(true);
	});

	it("migrates installs missing enableMemories to true", () => {
		const raw = { selectedModel: "claude-sonnet-4-6" };
		const result = normalizeSettings(raw);
		expect(result.enableMemories).toBe(true);
	});

	it("migrates installs missing memoryLastUsed to an empty object", () => {
		const raw = { selectedModel: "claude-sonnet-4-6" };
		const result = normalizeSettings(raw);
		expect(result.memoryLastUsed).toEqual({});
	});

	it("migrates installs missing modelTokenLimits to an empty object", () => {
		const raw = { selectedModel: "claude-sonnet-4-6" };
		const result = normalizeSettings(raw);
		expect(result.modelTokenLimits).toEqual({});
	});

	it("preserves current model selections supplied in raw", () => {
		const raw = { selectedModel: "claude-sonnet-5" };
		const result = normalizeSettings(raw);
		expect(result.selectedModel).toBe("claude-sonnet-5");
	});

	it("preserves an existing memoryLastUsed map supplied in raw", () => {
		const raw = { memoryLastUsed: { "hydrate-chats/memories/a.md": 123 } };
		const result = normalizeSettings(raw);
		expect(result.memoryLastUsed).toEqual({
			"hydrate-chats/memories/a.md": 123,
		});
	});

	it("preserves an existing modelTokenLimits map supplied in raw", () => {
		const raw = {
			modelTokenLimits: { "claude-sonnet-4-6": { output: 50_000 } },
		};
		const result = normalizeSettings(raw);
		expect(result.modelTokenLimits).toEqual({
			"claude-sonnet-4-6": { output: 50_000 },
		});
	});

	it("preserves an existing enableMemories value of false supplied in raw", () => {
		const raw = { enableMemories: false };
		const result = normalizeSettings(raw);
		expect(result.enableMemories).toBe(false);
	});

	describe("registryEntries repair", () => {
		it("repairs a non-array value to an array containing the default /issue entry", () => {
			const result = normalizeSettings({ registryEntries: "garbage" });
			expect(result.registryEntries).toEqual([
				expect.objectContaining(DEFAULT_ISSUE_ENTRY_SHAPE),
			]);
		});

		it("injects the default entry into an existing array that lacks it", () => {
			const existing = [
				{
					id: "custom-1",
					description: "custom entry",
					version: 1,
					contentType: "markdown",
					content: "hi",
				},
			];
			const result = normalizeSettings({ registryEntries: existing });
			expect(result.registryEntries).toHaveLength(2);
			expect(result.registryEntries).toEqual(
				expect.arrayContaining([
					expect.objectContaining(DEFAULT_ISSUE_ENTRY_SHAPE),
				]),
			);
		});

		it("does not duplicate the default entry when already present", () => {
			const existing = [
				{
					id: "default-issue-board",
					description: "Default template for creating an issue board.",
					version: 1,
					contentType: "markdown",
					content: "custom-content",
					slashCommandTrigger: "/issue",
				},
			];
			const result = normalizeSettings({ registryEntries: existing });
			expect(result.registryEntries).toHaveLength(1);
			expect(result.registryEntries[0].content).toBe("custom-content");
		});
	});

	describe("rulesRegistryEntries repair", () => {
		it("repairs a non-array value to an array containing the default rule", () => {
			const result = normalizeSettings({
				rulesRegistryEntries: "garbage",
			});
			expect(result.rulesRegistryEntries).toEqual([
				DEFAULT_CONVERSATION_RULE,
			]);
		});

		it("injects the default rule into an existing array that lacks it", () => {
			const existing = [
				{
					id: "custom-rule",
					description: "custom rule",
					ruleText: "text",
					version: 1,
				},
			];
			const result = normalizeSettings({
				rulesRegistryEntries: existing,
			});
			expect(result.rulesRegistryEntries).toHaveLength(2);
			expect(result.rulesRegistryEntries).toEqual(
				expect.arrayContaining([DEFAULT_CONVERSATION_RULE]),
			);
		});

		it("does not duplicate the default rule when already present", () => {
			const existing = [DEFAULT_CONVERSATION_RULE];
			const result = normalizeSettings({
				rulesRegistryEntries: existing,
			});
			expect(result.rulesRegistryEntries).toHaveLength(1);
		});
	});

	describe("chatHistories repair", () => {
		it("repairs a non-array value to an empty array", () => {
			const result = normalizeSettings({ chatHistories: "garbage" });
			expect(result.chatHistories).toEqual([]);
		});

		it("leaves an existing array untouched", () => {
			const existing = [
				{
					id: "chat-1",
					title: "Chat",
					turns: [],
					conversationId: null,
					attachedFiles: [],
					created: "2026-01-01T00:00:00.000Z",
					lastModified: "2026-01-01T00:00:00.000Z",
				},
			];
			const result = normalizeSettings({ chatHistories: existing });
			expect(result.chatHistories).toEqual(existing);
		});
	});

	it("returns a fresh object; mutating the result does not mutate DEFAULT_SETTINGS", () => {
		const before = JSON.parse(
			JSON.stringify(DEFAULT_SETTINGS),
		) as typeof DEFAULT_SETTINGS;
		const result = normalizeSettings(null);

		expect(result).not.toBe(DEFAULT_SETTINGS);

		result.selectedModel = "claude-sonnet-5";
		result.registryEntries.push({
			id: "extra-entry",
			description: "extra",
			version: 1,
			contentType: "markdown",
			content: "extra",
		});
		result.rulesRegistryEntries.push({
			id: "extra-rule",
			description: "extra",
			ruleText: "extra",
			version: 1,
		});
		result.chatHistories.push({
			id: "extra-chat",
			title: "extra",
			turns: [],
			conversationId: null,
			attachedFiles: [],
			created: "2026-01-01T00:00:00.000Z",
			lastModified: "2026-01-01T00:00:00.000Z",
		});
		result.memoryLastUsed["hydrate-chats/memories/extra.md"] = 42;
		result.modelTokenLimits["claude-sonnet-4-6"] = { output: 50_000 };

		expect(DEFAULT_SETTINGS).toEqual(before);
	});
});


describe("model upgrades", () => {
	it.each([
		["gpt-5.5", "gpt-6-astra"],
		["gpt-5.4", "gpt-6-sol"],
		["gpt-5.4-mini", "gpt-6-luna"],
		["gpt-5.4-nano", "gpt-6-luna"],
		["claude-opus-4-8", "claude-opus-5-5"],
		["claude-sonnet-4-6", "claude-sonnet-5"],
		["gemini-3.5-flash", "gemini-3.8-flash"],
		["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"],
	])("upgrades %s to %s and preserves token overrides", (oldModel, newModel) => {
		const raw = { selectedModel: oldModel, modelTokenLimits: { [oldModel]: { output: 4096 } } };
		const upgraded = normalizeSettings(raw);
		expect(upgraded.selectedModel).toBe(newModel);
		expect(upgraded.modelTokenLimits[newModel]).toEqual({ output: 4096 });
		expect(raw.modelTokenLimits[newModel]).toBeUndefined();
		expect(normalizeSettings(upgraded)).toEqual(upgraded);
	});
	it("keeps existing limits for the destination model", () => {
		const upgraded = normalizeSettings({ selectedModel: "gpt-5.4-mini", modelTokenLimits: {
			"gpt-5.4-mini": { output: 4096 }, "gpt-6-luna": { output: 8192 },
		} });
		expect(upgraded.modelTokenLimits["gpt-6-luna"]).toEqual({ output: 8192 });
	});
});
