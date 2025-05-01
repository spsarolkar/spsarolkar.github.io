---
layout: post
title: Preview of themes for Rouge syntax highlighter
date: 2018-08-05 22:55:00 +0530
categories: rouge themes syntax-highlighter
disqus_comments: true
---

Rouge is a popular syntax highlighter written in Ruby to provide the capability of syntax highlighting for code written on html pages. Rouge supports many different themes. While implementing the same feature for my blog I realized that there is no preview page where I can see how these themes look like. So I took the challenge and written my own, its written using javascript and all the static code gets generated using Jekyll. Please follow this link - [Rouge Syntax highlighter preview page](https://spsarolkar.github.io/rouge-theme-preview/)

![rouge_syntax_highlighter_preview_page_select_theme]

As you can see it shows all the themes available for Rouge, select any theme and after selection you will see the syntax highlighter applied for specific theme on the sample code.

#### Code implementation

Core of the code lies in the shell script `generateThemeYaml.sh` , this shell script has two jobs first is collect all themes supported by Rouge and store it in the `themes.yaml` file under `_data` directory and second being generate css file for each of the theme and store it under `css` directory with file name format `syntax-<theme-name>.css`.

The `themes.yaml` look as below

```yaml
- base16
- base16.dark
- base16.light
- base16.monokai
```

After generating `themes.yaml` and all stylesheets. We just need to iterate it in our Jekyll page using liquid syntax.

```html
{% raw %} {% for themename in site.data.themes %}
<a class="dropdown-item" href="javascript:reaplyStyles('{{themename}}')">{{ themename }}</a>
{% endfor %} {% endraw %}
```

Above code generated the dropdown list populated with all the themes. Once dropdown is selected its the simple Jquery to remove the existing themes stylesheet(if any) and add new stylesheet for the new theme selected.

```javascript
function removeAllSyntaxStyles() {
  $('link[rel=stylesheet][href*="syntax"]').remove();
}

function addStyle(themename) {
  $("<link>")
    .attr("rel", "stylesheet")
    .attr("type", "text/css")
    .attr("href", "css/syntax-" + themename + ".css")
    .appendTo("head");
}

function reaplyStyles(themename) {
  removeAllSyntaxStyles();
  addStyle(themename);
  return true;
}
```

I feel the utility is still at basic level and it does not allow selecting the custom background for the users who want to see how code looks for different background colours. This is a TODO for now.

Please feel free to [fork the repository](https://github.com/spsarolkar/rouge-theme-preview) if you feel adding any new feature. Please note that all the code is present under `gh-pages` branch

[rouge_syntax_highlighter_preview_page_select_theme]: /assets/blog/RougeSyntaxHeighlighterPreviewPage/rouge_syntax_highlighter_preview_page_select_theme.png
