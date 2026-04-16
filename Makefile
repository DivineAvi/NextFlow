# Defined colors for the terminal
BLUE   := \033[36m
GREEN  := \033[32m
RESET  := \033[0m

.PHONY: dev setup infra down clean

# -e: exit on error
# -u: error on unset variables
SHELL := /bin/bash -eu

setup:
	@printf "$(BLUE)⚒️  Forging dependencies...$(RESET)\n"
	@pnpm install
	@printf "$(BLUE)🐳 Starting infrastructure...$(RESET)\n"
	@docker-compose up -d
	@printf "$(GREEN)✅ Setup complete. Your environment is ready.$(RESET)\n"

infra:
	@printf "$(BLUE)📡 Bringing up Postgres & Redis...$(RESET)\n"
	@docker-compose up -d

dev:
	@printf "$(BLUE)🚀 Starting Turborepo Orchestrator...$(RESET)\n"
	@pnpm turbo run dev

down:
	@printf "$(BLUE)🛑 Shutting down containers...$(RESET)\n"
	@docker-compose down

clean:
	@printf "$(BLUE)🧹 Nuking environment...$(RESET)\n"
	@docker-compose down -v
	@rm -rf node_modules
	@printf "$(GREEN)✨ Workspace is clean.$(RESET)\n"