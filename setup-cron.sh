#!/bin/bash

###############################################################################
# CRON Job Setup Script for Daily Salary Closing
# This script sets up automatic daily closing at 23:59
###############################################################################

echo "=========================================="
echo "Setting up CRON job for Daily Salary Closing"
echo "=========================================="

# Get the current directory (project root)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Project Directory: $PROJECT_DIR"

# Path to the cron job script
CRON_SCRIPT="$PROJECT_DIR/server/cronJob.js"

# Path to Node.js (use 'which node' to find it)
NODE_PATH=$(which node)
echo "Node.js Path: $NODE_PATH"

# Check if cronJob.js exists
if [ ! -f "$CRON_SCRIPT" ]; then
    echo "Error: cronJob.js not found at $CRON_SCRIPT"
    exit 1
fi

# Make the script executable
chmod +x "$CRON_SCRIPT"
echo "✓ Made cronJob.js executable"

# Create log directory
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"
echo "✓ Created log directory: $LOG_DIR"

# Cron job command
# Runs every day at 23:59
CRON_COMMAND="59 23 * * * cd $PROJECT_DIR && $NODE_PATH $CRON_SCRIPT >> $LOG_DIR/daily-closing.log 2>&1"

# Check if cron job already exists
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "$CRON_SCRIPT")

if [ -n "$EXISTING_CRON" ]; then
    echo "⚠ CRON job already exists:"
    echo "  $EXISTING_CRON"
    read -p "Do you want to replace it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    # Remove existing cron job
    crontab -l 2>/dev/null | grep -v -F "$CRON_SCRIPT" | crontab -
    echo "✓ Removed existing CRON job"
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -
echo "✓ Added new CRON job"

# Display current crontab
echo ""
echo "=========================================="
echo "Current CRON jobs:"
echo "=========================================="
crontab -l
echo ""

echo "=========================================="
echo "✓ CRON job setup completed successfully!"
echo "=========================================="
echo ""
echo "The system will automatically close daily salary data at 23:59 every day."
echo "Logs will be saved to: $LOG_DIR/daily-closing.log"
echo ""
echo "To view logs in real-time:"
echo "  tail -f $LOG_DIR/daily-closing.log"
echo ""
echo "To manually run the closing process:"
echo "  node $CRON_SCRIPT"
echo ""
echo "To remove the CRON job:"
echo "  crontab -e"
echo "  (then delete the line containing 'cronJob.js')"
echo ""
