export function getPrPrompt(input: string, format: string): string {
  return `You are an AI assistant that generates professional Pull Request descriptions from rough developer notes.

RULES:
- Generate a comprehensive PR description
- Use proper markdown formatting
- Be professional and clear
- Include all relevant sections

OUTPUT STRUCTURE:
## Summary
[Brief overview of changes]

## Changes Made
- [Specific change 1]
- [Specific change 2]

## Testing Notes
- [How to test]
- [What to verify]

## Related Issues
- [Any related tasks or issues]

## Screenshots
N/A (if no UI changes)

## Additional Notes
- [Any important context]

USER INPUT:
${input}

Format for: ${format}

Generate the PR description now. Only output the PR description.`
}
