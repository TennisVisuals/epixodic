<script lang="ts">
  interface NavItem {
    iconClass: string;
    onclick: () => void;
    visible?: boolean;
  }

  let { title, navItems = [] }: { title: string; navItems: NavItem[] } = $props();
</script>

<div class="fixedmenu flexrows">
  <div class="fm_header">{title}</div>
  {#each navItems as item}
    {#if item.visible !== false}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="fm_action" onclick={item.onclick} onkeydown={item.onclick} role="button" tabindex="0">
        <div class="menu_icon {item.iconClass}"></div>
      </div>
    {/if}
  {/each}
</div>
