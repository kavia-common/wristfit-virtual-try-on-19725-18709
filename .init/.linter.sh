#!/bin/bash
cd /home/kavia/workspace/code-generation/wristfit-virtual-try-on-19725-18709/frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

