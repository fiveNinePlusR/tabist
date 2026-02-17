<script>
  import { onDestroy } from 'svelte';
  export let src = '';
  let imgEl;

  onDestroy(() => {
    // Clear the DOM image src to help the browser free decoded image memory
    if (imgEl) {
      try { imgEl.src = ''; } catch (e) { /* ignore */ }
    }

    // If this was a blob URL and nobody else will revoke it, revoke now
    if (src && typeof src === 'string' && src.startsWith('blob:')) {
      try { URL.revokeObjectURL(src); } catch (e) { /* ignore */ }
    }
  });
</script>

<img bind:this={imgEl}
     src={src}
     width="24"
     height="24"
     alt=""
     hidden={src === undefined || src == ""}
     on:error={() => { if (imgEl) imgEl.src = ''; }}
 />
