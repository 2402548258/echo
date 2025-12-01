const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` 可以指定多个构建入口，分别用于主进程、预加载脚本、工作线程等。
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            //target 是 Vite 配置中的一个属性，用于指定编译的目标环境。
            // 在 Electron 中，target 的使用主要是为了区分不同的进程类型，例如 Main process（主进程）、Preload（预加载脚本）和 Renderer（渲染进程）
            entry: 'main/index.ts',
            config: 'vite.main.config.ts',
            target: 'main',
          },
          {
            entry: 'preload.ts',
            config: 'vite.preload.config.ts',
            target: 'preload',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.ts',
          },
        ],
      },
    },
    // Fuses 用于在打包时启用/禁用各种 Electron 功能，
    // 这发生在应用程序代码签名之前。
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
