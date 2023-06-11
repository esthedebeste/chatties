<script lang="civet">
    export let value: string
    export let options: string[]
</script>

<select bind:value>
    {#each options as option(option)}
        <option value={option}>{option}</option>
    {/each}
</select>
