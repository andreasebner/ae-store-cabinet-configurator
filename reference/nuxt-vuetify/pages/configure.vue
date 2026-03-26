<template>
  <v-layout class="fill-height">
    <v-app-bar density="compact" flat class="border-b">
      <AppHeader />
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-0 fill-height">
        <v-row no-gutters class="fill-height">
          <!-- Left sidebar: Side pills -->
          <v-col cols="auto" class="d-flex align-center justify-center" style="width:64px">
            <SidePills />
          </v-col>

          <!-- Center area: toolbar + 3D + editor -->
          <v-col class="d-flex flex-column fill-height">
            <EditorToolbar />

            <div class="flex-grow-1 d-flex" style="min-height:0">
              <!-- 3D preview -->
              <div class="d-flex align-center justify-center" style="width:280px;min-width:200px">
                <Cabinet3DPreview />
              </div>

              <!-- 2D Panel editor -->
              <div class="flex-grow-1 d-flex flex-column" style="min-width:0">
                <PanelEditor />
                <EditorFooter />
              </div>
            </div>
          </v-col>

          <!-- Right sidebar: properties + element list -->
          <v-col cols="auto" style="width:280px" class="border-l d-flex flex-column fill-height bg-surface">
            <PropertiesPanel />
            <v-divider />
            <ElementList />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { useKeyboardShortcuts } from '~/composables/useKeyboardShortcuts';
useKeyboardShortcuts();
</script>
