/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Fallback for node modules and optional dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      buffer: false,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
    };

    // Handle WASM files for FHEVM
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    // WASM module rules
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Handle fhevmjs specifically
    config.module.rules.push({
      test: /node_modules\/fhevmjs/,
      use: ['@babel/loader'],
      type: 'javascript/auto',
    });

    // Ignore WASM-related warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/fhevmjs/ },
      /Can't resolve 'tfhe_bg\.wasm'/,
      /Critical dependency: the request of a dependency is an expression/,
    ];

    // Externalize fhevmjs on the server to prevent SSR issues
    if (isServer) {
      config.externals = [...(config.externals || []), 'fhevmjs', 'tfhe'];
    }

    return config;
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
