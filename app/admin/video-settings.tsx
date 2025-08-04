"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useVideoSettings } from "./video-settings/hooks/use-video-settings"
import { GeneralSettingsTab } from "./video-settings/components/general-settings-tab"
import { TopicsTab } from "./video-settings/components/topics-tab"
import { SaveButton } from "./video-settings/components/save-button"
import type { VideoSettingsProps } from "./video-settings/types"

export default function VideoSettings({
  initialDuration = 180,
  initialMinDuration = 180,
  initialAutoPublish = true,
}: VideoSettingsProps) {
  const { state, filteredTopics, updateState, addTopic, removeTopic, toggleTrending, refreshTopics, handleSave } =
    useVideoSettings({
      initialDuration,
      initialMinDuration,
      initialAutoPublish,
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Settings</CardTitle>
        <CardDescription>Configure settings for daily challenge videos</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="general"
          value={state.activeTab}
          onValueChange={(value) => updateState({ activeTab: value })}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="topics">Video Topics</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettingsTab
              minDuration={state.minDuration}
              maxDuration={state.maxDuration}
              autoPublish={state.autoPublish}
              onUpdate={updateState}
            />
          </TabsContent>

          <TabsContent value="topics">
            <TopicsTab
              topics={state.topics}
              filteredTopics={filteredTopics}
              searchTerm={state.searchTerm}
              newTopic={state.newTopic}
              loadingTopics={state.loadingTopics}
              onSearchChange={(term) => updateState({ searchTerm: term })}
              onNewTopicChange={(topic) => updateState({ newTopic: topic })}
              onAddTopic={addTopic}
              onRemoveTopic={removeTopic}
              onToggleTrending={toggleTrending}
              onRefreshTopics={refreshTopics}
            />
          </TabsContent>
        </Tabs>

        <SaveButton saving={state.saving} onSave={handleSave} />
      </CardContent>
    </Card>
  )
}
