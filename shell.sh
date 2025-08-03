[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias grep='grep --color=auto'

set_ps1() {
    local RED="\[\033[0;31m\]"
    local GREEN="\[\033[0;32m\]"
    local YELLOW="\[\033[0;33m\]"
    local BLUE="\[\033[0;34m\]"
    local CYAN="\[\033[0;36m\]"
    local RESET="\[\033[0m\]"

    export PS1=""

    [[ $? -ne 0 ]] && \
        PS1+="\n${RED}[✗ $?]${RESET} "

    PS1+="${GREEN}\u@\h${RESET}:"
    PS1+="${BLUE}\w${RESET}"

    git rev-parse --is-inside-work-tree &>/dev/null && \
        PS1+=$(git symbolic-ref --short HEAD 2>/dev/null || git describe --tags --exact-match 2>/dev/null)

    PS1+="\n\$ "

}

PROMPT_COMMAND="set_ps1"

PATH=$PATH:$HOME/go/bin
