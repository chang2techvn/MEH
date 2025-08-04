export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export const formatUsageStats = (usage: { conversations: number; messages: number; tokensConsumed: number }) => {
  return {
    conversations: usage.conversations.toLocaleString(),
    messages: usage.messages.toLocaleString(),
    tokens: `${(usage.tokensConsumed / 1000).toFixed(1)}K`,
  }
}
