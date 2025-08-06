PATH="$HOME/go/bin:$PATH"

_darwin_profile() {
  alias code=codium
  export CLICOLOR=1
  PATH="/opt/homebrew/bin:$PATH"
}

[[ $(uname) == "Darwin" ]] && _darwin_profile

[[ $- != *i* ]] && return

export BASH_SILENCE_DEPRECATION_WARNING=1

alias ls='ls --color=auto'
alias grep='grep --color=auto'

_prompt_command() {
    local CODE="$?"
    local RESET="\[\033[00m\]"

    PS1=""

    [[ $CODE != 0 ]] && \
        PS1+="\[\033[01;31m\][❌$CODE] "

    PS1+="\[\033[01;94m\]\u@\h$RESET:"
    PS1+="\[\033[01;96m\]\w"

    git rev-parse --is-inside-work-tree &>/dev/null && git symbolic-ref --short HEAD &>/dev/null && \
        PS1+="\[\033[01;95m\] (┣ $(git symbolic-ref --short HEAD 2>/dev/null))"

    git rev-parse --is-inside-work-tree &>/dev/null && git describe --tags --exact-match &>/dev/null && \
      PS1+="\[\033[01;95m\] (🏷️  $(git describe --tags --exact-match 2>/dev/null))"

    PS1+="$RESET\n\$ "
}

PROMPT_COMMAND=_prompt_command
