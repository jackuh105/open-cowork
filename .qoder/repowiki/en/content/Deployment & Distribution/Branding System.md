# Branding System

<cite>
**Referenced Files in This Document**
- [brand-main.ts](file://src/main/branding/brand-main.ts)
- [__generated-brand.ts](file://src/shared/branding/__generated-brand.ts)
- [brand-runtime.ts](file://src/shared/branding/brand-runtime.ts)
- [brand-schema.ts](file://src/shared/branding/brand-schema.ts)
- [brand-types.ts](file://src/shared/branding/brand-types.ts)
- [apply-brand.js](file://scripts/apply-brand.js)
- [build-brand.js](file://scripts/build-brand.js)
- [reset-brand.js](file://scripts/reset-brand.js)
- [useBrand.ts](file://src/renderer/hooks/useBrand.ts)
- [SettingsPanel.tsx](file://src/renderer/components/SettingsPanel.tsx)
</cite>

## Update Summary

**Changes Made**

- Added documentation for new settings visibility feature with configurable settings tabs
- Updated build system to include runtime tab filtering capabilities
- Enhanced TypeScript interfaces with visibleSettings property
- Added validation logic for visibleSettings configuration

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Settings Visibility Feature](#settings-visibility-feature)
7. [Build System](#build-system)
8. [Runtime Branding](#runtime-branding)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Conclusion](#conclusion)

## Introduction

The Open Cowork branding system is a comprehensive framework designed to enable customizable branding for the Electron-based desktop application. This system allows developers to modify visual elements such as application icons, window decorations, splash screens, and other UI components while maintaining a consistent user experience across different branded deployments.

The branding system operates through a multi-layered architecture that separates build-time branding from runtime customization, ensuring flexibility while maintaining performance and reliability. It supports both development and production environments with automated tooling for seamless branding updates.

**Updated** Added support for configurable settings tabs visibility control, allowing organizations to customize which settings tabs are displayed based on their specific needs.

## Project Structure

The branding system is organized across three primary layers: shared branding definitions, main process branding integration, and renderer process branding hooks. This separation ensures clean boundaries between Electron's main and renderer processes while providing unified access to branding information.

```mermaid
graph TB
subgraph "Shared Layer"
SharedBrand["Shared Branding<br/>Definitions"]
BrandSchema["Brand Schema<br/>Validation"]
BrandTypes["Brand Types<br/>Interfaces"]
end
subgraph "Main Process"
BrandMain["Brand Main<br/>Process Integration"]
GeneratedBrand["Generated Brand<br/>Runtime Data"]
end
subgraph "Renderer Process"
UseBrand["Use Brand Hook<br/>UI Integration"]
BrandRuntime["Brand Runtime<br/>Access Methods"]
end
subgraph "Settings Visibility"
SettingsPanel["Settings Panel<br/>Tab Filtering"]
VisibleSettings["Visible Settings<br/>Configuration"]
end
SharedBrand --> BrandMain
BrandSchema --> GeneratedBrand
BrandTypes --> BrandRuntime
GeneratedBrand --> UseBrand
BrandRuntime --> UseBrand
BrandTypes --> SettingsPanel
SettingsPanel --> VisibleSettings
```

**Diagram sources**

- [brand-main.ts:1-50](file://src/main/branding/brand-main.ts#L1-L50)
- [\_\_generated-brand.ts:1-80](file://src/shared/branding/__generated-brand.ts#L1-L80)
- [brand-runtime.ts:1-60](file://src/shared/branding/brand-runtime.ts#L1-L60)
- [SettingsPanel.tsx:54-64](file://src/renderer/components/SettingsPanel.tsx#L54-L64)

**Section sources**

- [brand-main.ts:1-100](file://src/main/branding/brand-main.ts#L1-L100)
- [brand-schema.ts:1-80](file://src/shared/branding/brand-schema.ts#L1-L80)
- [brand-types.ts:1-80](file://src/shared/branding/brand-types.ts#L1-L80)

## Core Components

The branding system consists of several interconnected components that work together to provide comprehensive branding capabilities:

### Shared Branding Definitions

The shared layer contains type definitions and validation schemas that ensure consistency across all application layers. These definitions establish the contract for branding data structures and provide TypeScript interfaces for type-safe access.

### Main Process Integration

The main process component handles Electron-specific branding operations, including window decorations, menu bar customization, and system tray integration. This layer bridges the gap between branding definitions and Electron's native APIs.

### Renderer Process Hooks

The renderer process provides React hooks that enable UI components to access branding information dynamically. These hooks facilitate responsive design and allow for real-time branding updates without requiring application restarts.

**Updated** Enhanced with settings visibility configuration that allows organizations to control which settings tabs are displayed based on their branding requirements.

**Section sources**

- [\_\_generated-brand.ts:1-120](file://src/shared/branding/__generated-brand.ts#L1-L120)
- [brand-runtime.ts:1-100](file://src/shared/branding/brand-runtime.ts#L1-L100)
- [useBrand.ts:1-80](file://src/renderer/hooks/useBrand.ts#L1-L80)

## Architecture Overview

The branding system follows a layered architecture pattern that separates concerns between build-time configuration, runtime access, and UI integration. This design enables flexible branding while maintaining performance and type safety.

```mermaid
classDiagram
class BrandSchema {
+validateBrandConfig(config) boolean
+getDefaultBrand() BrandConfig
+mergeBrandOverrides(base, overrides) BrandConfig
}
class BrandTypes {
+BrandConfig
+BrandColors
+BrandAssets
+BrandMetadata
+VisibleSettings
}
class BrandMain {
+initializeBranding() void
+applyWindowBranding(window) void
+updateSystemTray(icon) void
+getBrandingData() BrandConfig
}
class BrandRuntime {
+getAppName() string
+getAppVersion() string
+getBrandColors() BrandColors
+getBrandingAssets() BrandAssets
+isBrandingAvailable() boolean
}
class UseBrand {
+useBrand() BrandHookResult
+useBrandColor(token) string
+useBrandAsset(name) string
+useBrandingAvailable() boolean
}
class SettingsPanel {
+filterHiddenTabs(tabs) Tab[]
+resolveVisibleInitialTab(tab) TabId
+applyTabVisibilityFilter() void
}
BrandSchema --> BrandTypes : defines
BrandMain --> BrandRuntime : uses
UseBrand --> BrandRuntime : accesses
BrandMain --> BrandSchema : validates
SettingsPanel --> BrandTypes : uses
```

**Diagram sources**

- [brand-schema.ts:1-100](file://src/shared/branding/brand-schema.ts#L1-L100)
- [brand-types.ts:1-120](file://src/shared/branding/brand-types.ts#L1-L120)
- [brand-main.ts:1-120](file://src/main/branding/brand-main.ts#L1-L120)
- [brand-runtime.ts:1-120](file://src/shared/branding/brand-runtime.ts#L1-L120)
- [useBrand.ts:1-100](file://src/renderer/hooks/useBrand.ts#L1-L100)
- [SettingsPanel.tsx:54-64](file://src/renderer/components/SettingsPanel.tsx#L54-L64)

## Detailed Component Analysis

### Brand Schema Validation

The brand schema component serves as the foundation for all branding validation and configuration management. It provides methods for validating brand configurations, merging overrides, and establishing default values.

```mermaid
sequenceDiagram
participant Config as "Brand Config"
participant Schema as "Brand Schema"
participant Validator as "Validation Engine"
Config->>Schema : loadBrandConfig()
Schema->>Validator : validateBrandConfig(config)
Validator-->>Schema : validationResults
Schema->>Schema : mergeBrandOverrides(defaults, overrides)
Schema-->>Config : validatedBrandConfig
```

**Diagram sources**

- [brand-schema.ts:1-80](file://src/shared/branding/brand-schema.ts#L1-L80)

**Section sources**

- [brand-schema.ts:1-120](file://src/shared/branding/brand-schema.ts#L1-L120)

### Generated Brand Runtime

The generated brand runtime component creates optimized access patterns for branding data. It generates type-safe interfaces and provides efficient lookup mechanisms for branding assets and metadata.

```mermaid
flowchart TD
Start([Brand Generation Start]) --> LoadConfig["Load Brand Configuration"]
LoadConfig --> ValidateConfig["Validate Configuration"]
ValidateConfig --> GenerateTypes["Generate Type Definitions"]
GenerateTypes --> OptimizeData["Optimize Data Structures"]
OptimizeData --> CreateAccessors["Create Accessor Functions"]
CreateAccessors --> ExportModule["Export Runtime Module"]
ExportModule --> End([Generation Complete])
```

**Diagram sources**

- [\_\_generated-brand.ts:1-100](file://src/shared/branding/__generated-brand.ts#L1-L100)

**Section sources**

- [\_\_generated-brand.ts:1-150](file://src/shared/branding/__generated-brand.ts#L1-L150)

### Main Process Brand Integration

The main process integration handles Electron-specific branding operations including window customization, system tray updates, and menu bar modifications. This component ensures that branding changes are applied consistently across all application windows.

**Section sources**

- [brand-main.ts:1-200](file://src/main/branding/brand-main.ts#L1-L200)

### Renderer Process Brand Hooks

The renderer process provides React hooks that enable UI components to access branding information dynamically. These hooks facilitate responsive design and allow for real-time branding updates without requiring application restarts.

**Section sources**

- [useBrand.ts:1-120](file://src/renderer/hooks/useBrand.ts#L1-L120)

## Settings Visibility Feature

**New** The settings visibility feature provides configurable control over which settings tabs are displayed to users. This enhancement allows organizations to tailor the application interface based on their specific operational requirements.

### Configuration Structure

The settings visibility feature is controlled through the `visibleSettings` property in brand configuration, which accepts an array of tab identifiers that should be displayed.

```mermaid
flowchart TD
BrandConfig["Brand Configuration"] --> VisibleSettings["visibleSettings Array"]
VisibleSettings --> Validation["Validation Logic"]
Validation --> BuildTime["Build-Time Processing"]
Validation --> Runtime["Runtime Filtering"]
BuildTime --> HiddenTabs["Hidden Tabs Detection"]
Runtime --> TabFiltering["Tab Filtering Process"]
HiddenTabs --> SettingsPanel["Settings Panel"]
TabFiltering --> SettingsPanel
SettingsPanel --> UserInterface["Filtered UI"]
```

**Diagram sources**

- [apply-brand.js:567-610](file://scripts/apply-brand.js#L567-L610)
- [SettingsPanel.tsx:54-64](file://src/renderer/components/SettingsPanel.tsx#L54-L64)

### Implementation Details

The settings visibility feature implements both build-time and runtime filtering mechanisms:

1. **Build-Time Filtering**: The `apply-brand.js` script analyzes the `visibleSettings` configuration and injects tab filtering logic directly into the `SettingsPanel.tsx` component during the build process.

2. **Runtime Filtering**: The `SettingsPanel` component includes dynamic tab filtering that respects the branding configuration while maintaining runtime flexibility.

3. **Fallback Mechanisms**: The system ensures that essential tabs (particularly the 'general' tab) remain accessible even when visibility configurations change.

**Section sources**

- [apply-brand.js:567-610](file://scripts/apply-brand.js#L567-L610)
- [SettingsPanel.tsx:54-64](file://src/renderer/components/SettingsPanel.tsx#L54-L64)

## Build System

The build system provides comprehensive tooling for managing branding across different environments and deployment scenarios. It includes scripts for applying, building, and resetting branding configurations.

```mermaid
graph LR
subgraph "Build Scripts"
ApplyBrand["apply-brand.js<br/>Apply Branding Changes"]
BuildBrand["build-brand.js<br/>Build Brand Assets"]
ResetBrand["reset-brand.js<br/>Reset Brand Defaults"]
end
subgraph "Brand Assets"
BrandConfig["brand-config.json<br/>Branding Configuration"]
BrandIcons["brand-icons/*<br/>Icon Resources"]
BrandAssets["brand-assets/*<br/>Static Assets"]
end
subgraph "Output"
GeneratedBrand["__generated-brand.ts<br/>Generated Runtime"]
CompiledApp["Compiled Application<br/>With Branding Applied"]
end
ApplyBrand --> BrandConfig
ApplyBrand --> BrandIcons
ApplyBrand --> BrandAssets
BuildBrand --> GeneratedBrand
ResetBrand --> BrandConfig
BrandConfig --> BuildBrand
BrandIcons --> BuildBrand
BrandAssets --> BuildBrand
GeneratedBrand --> CompiledApp
```

**Diagram sources**

- [apply-brand.js:1-80](file://scripts/apply-brand.js#L1-L80)
- [build-brand.js:1-80](file://scripts/build-brand.js#L1-L80)
- [reset-brand.js:1-80](file://scripts/reset-brand.js#L1-L80)

### Apply Brand Script

The apply brand script serves as the primary interface for modifying branding configurations. It validates new branding assets, merges them with existing configurations, and prepares the application for recompilation.

**Updated** Enhanced with settings visibility processing that injects tab filtering logic into the SettingsPanel component based on the `visibleSettings` configuration.

**Section sources**

- [apply-brand.js:1-120](file://scripts/apply-brand.js#L1-L120)

### Build Brand Script

The build brand script generates optimized runtime code from branding configurations. It processes brand assets, validates configurations, and produces the final compiled branding module.

**Section sources**

- [build-brand.js:1-120](file://scripts/build-brand.js#L1-L120)

### Reset Brand Script

The reset brand script restores default branding configurations and removes custom branding assets. This script is essential for development workflows and troubleshooting branding issues.

**Section sources**

- [reset-brand.js:1-120](file://scripts/reset-brand.js#L1-L120)

## Runtime Branding

The runtime branding system provides dynamic access to branding information throughout the application lifecycle. It enables real-time updates and maintains consistency across all application components.

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant Hook as "useBrand Hook"
participant Runtime as "Brand Runtime"
participant Main as "Main Process"
UI->>Hook : useBrand()
Hook->>Runtime : getAppName()
Runtime->>Main : getBrandingData()
Main-->>Runtime : BrandConfig
Runtime-->>Hook : Branding Information
Hook-->>UI : Branding Props
UI->>UI : Render with Branding
Note over UI,Main : Real-time Updates Supported
```

**Diagram sources**

- [useBrand.ts:1-100](file://src/renderer/hooks/useBrand.ts#L1-L100)
- [brand-runtime.ts:1-100](file://src/shared/branding/brand-runtime.ts#L1-L100)

**Section sources**

- [brand-runtime.ts:1-150](file://src/shared/branding/brand-runtime.ts#L1-L150)

## Development Workflow

The development workflow for the branding system emphasizes iterative development and rapid feedback cycles. Developers can modify branding assets and see changes reflected immediately in the application.

```mermaid
flowchart TD
DevStart([Developer Starts]) --> ModifyAssets["Modify Branding Assets"]
ModifyAssets --> RunApply["Run apply-brand.js"]
RunApply --> ValidateConfig["Validate Configuration"]
ValidateConfig --> BuildBrand["Run build-brand.js"]
BuildBrand --> CompileApp["Compile Application"]
CompileApp --> TestBrand["Test Branding Changes"]
TestBrand --> Iterate{"More Changes?"}
Iterate --> |Yes| ModifyAssets
Iterate --> |No| DeployBrand["Deploy Branding"]
DeployBrand --> DevComplete([Development Complete])
```

**Diagram sources**

- [apply-brand.js:1-100](file://scripts/apply-brand.js#L1-L100)
- [build-brand.js:1-100](file://scripts/build-brand.js#L1-L100)

### Development Best Practices

1. **Asset Organization**: Maintain a clear hierarchy for branding assets with separate directories for icons, images, and configuration files.

2. **Validation First**: Always validate branding configurations before applying changes to prevent runtime errors.

3. **Incremental Testing**: Test branding changes incrementally to identify issues early in the development cycle.

4. **Backup Strategy**: Maintain backups of original branding assets to enable quick restoration if needed.

5. **Settings Visibility Testing**: When configuring settings visibility, test both build-time and runtime filtering to ensure proper tab display behavior.

## Troubleshooting Guide

Common issues and solutions for the branding system:

### Configuration Validation Errors

**Symptoms**: Branding configuration fails validation during build process
**Causes**: Missing required fields, invalid asset paths, or incorrect data types
**Solutions**:

- Verify all required fields are present in brand configuration
- Check asset file paths and ensure files exist
- Validate data types match expected schema definitions

### Asset Loading Issues

**Symptoms**: Branding assets not displaying correctly in application
**Causes**: Incorrect asset paths, missing asset files, or unsupported formats
**Solutions**:

- Verify asset file extensions are supported
- Check asset file permissions and accessibility
- Ensure asset paths match configured locations

### Runtime Access Problems

**Symptoms**: Branding information not available in UI components
**Causes**: Runtime initialization failures or hook usage errors
**Solutions**:

- Verify branding system initialization completes successfully
- Check React hook usage patterns and dependencies
- Review console logs for initialization errors

### Settings Visibility Issues

**Symptoms**: Settings tabs not displaying correctly or hidden unexpectedly
**Causes**: Invalid `visibleSettings` configuration, missing tab identifiers, or filtering logic errors
**Solutions**:

- Verify all tab identifiers in `visibleSettings` are valid (api, sandbox, connectors, skills, memory, schedule, remote, logs, general)
- Ensure the 'general' tab is always included in visibility configurations
- Check build logs for settings panel patching errors
- Test runtime filtering behavior with different tab configurations

**Section sources**

- [brand-schema.ts:1-80](file://src/shared/branding/brand-schema.ts#L1-L80)
- [brand-main.ts:1-100](file://src/main/branding/brand-main.ts#L1-L100)
- [apply-brand.js:567-610](file://scripts/apply-brand.js#L567-L610)

## Conclusion

The Open Cowork branding system provides a robust, scalable solution for managing application branding across different deployment scenarios. Its layered architecture ensures maintainability while supporting dynamic branding updates and comprehensive customization capabilities.

The system's strength lies in its separation of concerns, with clear boundaries between build-time configuration, runtime access, and UI integration. This design enables developers to modify branding elements efficiently while maintaining application stability and performance.

**Updated** Recent enhancements include configurable settings tabs visibility control, which provides organizations with fine-grained control over the user interface presentation. The settings visibility feature combines build-time optimization with runtime flexibility to deliver a seamless user experience while respecting organizational branding requirements.

Key benefits of the current implementation include:

- Type-safe branding configurations
- Dynamic runtime access patterns
- Comprehensive validation and error handling
- Seamless integration with Electron's native APIs
- Support for both development and production workflows
- Configurable settings tabs visibility for tailored user experiences

Future enhancements could include expanded asset format support, advanced color scheme generation, automated branding preview capabilities, and additional customization options for the settings interface.
