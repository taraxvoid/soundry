module.exports = function(eleventyConfig) {
  // Pass through files
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/_data");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  // Watch for CSS changes
  eleventyConfig.setWatchThrottleWaitTime(100);

  // Watch target: postcss compile will handle src/css/style.css
  eleventyConfig.setWatchJavaScriptDependencies(false);

  // Add Tailwind CSS via esbuild plugin
  // For now, we'll use an inline script approach or handle CSS differently
  
  return {
    dir: {
      input: "src",
      output: "_site",
    },
    templateFormats: ["html", "md", "yml"],
  };
};
