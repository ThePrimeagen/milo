{
  "targets": [
    {
      "target_name": "native-sockets",
      "sources": [ "src/native-sockets.cc" ],
      "include_dirs": [
          "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
    }
  ]
}

