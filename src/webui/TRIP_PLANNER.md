# Trip Planner - Setup Guide

A modern web app for planning trips with AI-powered location extraction and Tianditu map integration.

## 1. Install and Setup LiteLLM

LiteLLM provides an OpenAI-compatible API proxy that can use various LLM backends (Gemini, Claude, etc.).

### Install LiteLLM

```bash
pip install litellm[proxy]
```

### Create Configuration File

Create `litellm_config.yaml` in your project root:

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gemini/gemini-2.0-flash
```

### Set Environment Variables

For Gemini, set your Google API key:

```bash
# Windows (PowerShell)
$env:GEMINI_API_KEY = "your-gemini-api-key"

# Windows (CMD)
set GEMINI_API_KEY=your-gemini-api-key

# Linux/Mac
export GEMINI_API_KEY="your-gemini-api-key"
```

## 2. Run LiteLLM Proxy

```bash
litellm --config litellm_config.yaml --port 4000
```

You should see:
```
Once running:
   * Address: http://localhost:4000
   * Usage: You can point any OpenAI-compatible app to this URL.
```

## 3. Build the Project

```bash
npm install
npm run build
```

## 4. Run the Web UI

```bash
npm run webui
```

Then open: **http://localhost:3000/trip-planner.html**

### First-Time Setup

1. Go to **Settings** tab (right sidebar)
2. Ensure **Local AI Server URL** is `http://localhost:4000`
3. Enter your **Tianditu API Key** (get one from https://console.tianditu.gov.cn/)
4. Click **Save Settings**
5. Click **Test Connection (Ping)** to verify AI is working

---

## Example Input

Paste this into the "Input Plan" textarea:

```
东北冰雪之旅详细攻略

一、沈阳（1月31日下午 - 2月2日上午）

（一）住宿
酒店：沈阳华府酒店。

（二）交通
到达：1月31日下午抵达沈阳北站后，乘坐出租车前往华府酒店，车程约20分钟。
出发：2月2日早上从华府酒店出发前往沈阳北站，乘坐高铁前往长白山西站。

（三）景点推荐
沈阳故宫：中国仅存的两大宫殿建筑群之一，具有极高的历史和艺术价值。门票50元，开放时间08:30 - 17:00。
中街商业街：中国第一条商业步行街，拥有丰富的历史文化底蕴和多样的旅游景点。

（四）餐饮推荐
早餐：
李连贵熏肉大饼总店（沈河店），地址：正阳街88号8门，人均消费36元。
老边饺子馆（中街店），地址：中街路208号，人均消费68元。
马家烧麦，地址：中街附近。

（五）洗浴体验
清河半岛温泉度假酒店：沈阳最大的洗浴中心，地址：沈阳市沈北新区蒲南路20号。
泡泡森林：新晋网红浴场，地址：沈阳市和平区南京南街226号。

二、长白山万达滑雪（2月2日 - 4日）

（一）住宿
酒店：长白山万达智选假日酒店。

（二）交通
到达：2月2日早上从沈阳北站乘坐G8153次高铁，06:56出发，08:38到达长白山西站。

（三）行程
2月2日下午：抵达后滑雪半天
2月3日-4日：全天滑雪
2月4日晚饭后：前往鲁能华美胜地住宿

三、长白山鲁能胜地（2月5日 - 6日）

2月5日-6日：滑雪
2月6日滑完雪后：前往北坡
```

Click **"Extract & Map Locations"** to process with AI.

---

## Example Generated Markdown

After AI processing, the app generates markdown like this (can be saved/loaded):

```markdown
# 东北冰雪之旅详细攻略

## 第1天 - 抵达沈阳
*Date: 2024-01-31*

**下午** - 沈阳北站,沈阳 *(123.430540, 41.814441)*
  抵达沈阳北站
**下午** - 沈阳华府酒店,沈阳 *(123.426640, 41.809000)*
  入住酒店

## 第2天 - 沈阳游览
*Date: 2024-02-01*

**08:30 - 17:00** - 沈阳故宫,沈阳 *(123.449760, 41.796460)*
  游览故宫
- 中街商业街,沈阳 *(123.450570, 41.798730)*
  游览商业街
**早餐** - 李连贵熏肉大饼总店(沈河店),沈阳 *(123.447730, 41.798295)*
  用餐
- 老边饺子馆(中街店),沈阳 *(123.454760, 41.799160)*
  用餐推荐
- 马家烧麦,沈阳 *(123.410980, 41.862820)*
  用餐推荐
- 清河半岛温泉度假酒店,沈阳 *(123.425920, 41.933670)*
  洗浴体验推荐
- 泡泡森林,沈阳 *(123.372300, 41.782150)*
  洗浴体验推荐

## 第3天 - 沈阳至长白山
*Date: 2024-02-02*

**06:56** - 沈阳北站,沈阳 *(123.430540, 41.814441)*
  乘坐G8153次高铁
**08:38** - 长白山西站,白山 *(127.475386, 42.186063)*
  抵达长白山西站
**下午** - 长白山万达国际度假区,白山 *(127.507980, 42.100730)*
  滑雪半天
**晚上** - 长白山万达智选假日酒店,白山 *(127.499930, 42.092630)*
  入住酒店

## 第4天 - 长白山万达滑雪
*Date: 2024-02-03*

**全天** - 长白山万达国际度假区,白山 *(127.507980, 42.100730)*
  滑雪

## 第5天 - 鲁能胜地
*Date: 2024-02-04*

**晚饭后** - 长白山鲁能胜地,白山 *(127.529910, 41.963500)*
  前往鲁能华美胜地住宿

## 第6天 - 鲁能滑雪及北坡
*Date: 2024-02-05*

**全天** - 长白山鲁能胜地,白山 *(127.529910, 41.963500)*
  滑雪
**滑完雪后** - 长白山北坡景区,白山 *(128.018770, 41.992220)*
  前往北坡
```

---

## 5. Markdown Format Specification

### How the App Parses Markdown Locations

The parser recognizes these patterns as location keypoints:

#### Pattern 1: Bold Time with Location
```markdown
**时间** - 地点名称,城市名 *(经度, 纬度)*
```
Example:
```markdown
**08:30** - 沈阳故宫,沈阳 *(123.449760, 41.796460)*
**下午** - 沈阳北站,沈阳 *(123.430540, 41.814441)*
**06:56 - 08:38** - 长白山西站,白山 *(127.475386, 42.186063)*
```

#### Pattern 2: Dash-prefixed Location (no time)
```markdown
- 地点名称,城市名 *(经度, 纬度)*
```
Example:
```markdown
- 中街商业街,沈阳 *(123.450570, 41.798730)*
- 马家烧麦,沈阳 *(123.410980, 41.862820)*
```

#### Pattern 3: Plain Time with Location
```markdown
08:30 - 地点名称,城市名 *(经度, 纬度)*
```

### Structure Elements

| Element | Format | Example |
|---------|--------|---------|
| Title | `# 标题` | `# 东北冰雪之旅` |
| Day Header | `## 第N天 - 描述` | `## 第1天 - 抵达沈阳` |
| Date | `*Date: YYYY-MM-DD*` | `*Date: 2024-01-31*` |
| Location with time | `**时间** - 地点,城市 *(lon, lat)*` | `**下午** - 沈阳北站,沈阳 *(123.43, 41.81)*` |
| Location no time | `- 地点,城市 *(lon, lat)*` | `- 中街商业街,沈阳 *(123.45, 41.80)*` |
| Description | Indented text after location | `  游览故宫` |

### Coordinates Format

Coordinates are **optional** when saving. If present:
- Format: `*(longitude, latitude)*`
- Example: `*(123.449760, 41.796460)*`
- Must be at the end of the line
- Wrapped in `*( )*`

When loading a markdown file:
- **With coordinates**: Markers are placed directly (no geocoding needed)
- **Without coordinates**: App will geocode using Tianditu API

### Location Name Requirements

**IMPORTANT**: Location names should be in **Chinese** for best geocoding results with Tianditu.

Good:
- `沈阳故宫,沈阳`
- `长白山万达国际度假区,白山`
- `李连贵熏肉大饼总店(沈河店),沈阳`

Bad (will have poor geocoding):
- `Shenyang Palace`
- `Changbaishan Wanda Resort`

---

## UI Features

### Tree View (Left Sidebar)
- **Checkbox**: Toggle marker visibility on map
- **Click row**: Pan map to location
- **Click day header**: Zoom to fit all day's locations
- **Expand All / Collapse All**: Control tree expansion
- **Show All / Hide All**: Toggle all markers

### Map Controls
- **Fit Bounds**: Zoom to show all markers
- **Clear Markers**: Remove all markers from map

### Keyboard Shortcuts
- `Ctrl+S`: Save trip as markdown
- `Ctrl+O`: Load markdown file

---

## Troubleshooting

### AI Connection Failed
1. Ensure LiteLLM is running on port 4000
2. Check `GEMINI_API_KEY` environment variable is set
3. Use "Test Connection (Ping)" button to verify

### Locations Not Found
1. Ensure location names are in Chinese
2. Include city name after location (e.g., `沈阳故宫,沈阳`)
3. Check Tianditu API key is configured

### Markers Not Showing
1. Check if coordinates are valid (not `[?]` in tree view)
2. Ensure Tianditu API key is set in Settings
3. Try "Fit Bounds" button to zoom to markers
