<script lang="ts">
import Dir from "../../components/Dir.svelte";
import { t } from "../../l10n.svelte";
// import { reset, length } from "../../settings.svelte";

</script>

<div>
	<h1>{t("Storage")}</h1>
	<h2>{t("Files")}</h2>
	<Dir />
	<!-- <h2>{t("Local settings")}</h2> -->
	<!-- <p>{length.n} items</p> -->
	<!-- <button onclick={reset}> -->
	<!-- 	{t("Clear local storage")} -->
	<!-- </button> -->
</div>
