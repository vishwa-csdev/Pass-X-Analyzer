
Audit summary:
- Backend tests previously reported passing.
- API URL now configurable through VITE_API_URL.
- Main risks identified:
  * Hard-coded GitHub URL in App.jsx.
  * No request cancellation for rapid password changes.
  * Generic API error messages.
  * SpaceBackground likely highest rendering-cost component.
  * No centralized API client/retry handling.
Recommended next phase: component-level refactor and UI modernization.
