"use client"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useSafetyState } from "./hooks/use-safety-state"
import { SafetyHeader } from "./components/safety-header"
import { SuccessAlert } from "./components/success-alert"
import { SafetyTabs } from "./components/safety-tabs"
import { OverviewTab } from "./components/tabs/overview-tab"
import { RulesTab } from "./components/tabs/rules-tab"
import { ContentTab } from "./components/tabs/content-tab"
import { TermsTab } from "./components/tabs/terms-tab"
import { SettingsTab } from "./components/tabs/settings-tab"
import { TestContentDialog } from "./components/test-content-dialog"

export default function AISafetyPage() {
  const {
    // State
    safetyRules,
    flaggedContent,
    bannedTerms,
    safetyMetrics,
    activeTab,
    searchQuery,
    isTestDialogOpen,
    testContent,
    testResults,
    isLoading,
    showSuccessAlert,
    filteredFlaggedContent,

    // Setters
    setActiveTab,
    setSearchQuery,
    setIsTestDialogOpen,
    setTestContent,

    // Actions
    toggleRuleEnabled,
    updateRuleThreshold,
    addBannedTerm,
    removeBannedTerm,
    updateContentStatus,
    testContentSafety,
    saveSettings,
  } = useSafetyState()

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      <SafetyHeader onSave={saveSettings} onTestContent={() => setIsTestDialogOpen(true)} />

      <SuccessAlert show={showSuccessAlert} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <SafetyTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab
            safetyMetrics={safetyMetrics}
            safetyRules={safetyRules}
            flaggedContent={flaggedContent}
            onToggleRule={toggleRuleEnabled}
            onUpdateThreshold={updateRuleThreshold}
            onViewAllContent={() => setActiveTab("content")}
            onManageRules={() => setActiveTab("rules")}
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <RulesTab
            safetyRules={safetyRules}
            onToggleRule={toggleRuleEnabled}
            onUpdateThreshold={updateRuleThreshold}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentTab
            filteredFlaggedContent={filteredFlaggedContent}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onUpdateStatus={updateContentStatus}
          />
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          <TermsTab bannedTerms={bannedTerms} onAddTerm={addBannedTerm} onRemoveTerm={removeBannedTerm} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsTab onSave={saveSettings} />
        </TabsContent>
      </Tabs>

      <TestContentDialog
        isOpen={isTestDialogOpen}
        onOpenChange={setIsTestDialogOpen}
        testContent={testContent}
        onTestContentChange={setTestContent}
        testResults={testResults}
        isLoading={isLoading}
        onTestContent={testContentSafety}
      />
    </div>
  )
}
