export type VariablesSchema = {
	device_ip: string

	[key: `pgm${number}_input`]: string
	[key: `pgm${number}_input_id`]: number
	[key: `pvw${number}_input`]: string
	[key: `pvw${number}_input_id`]: number

	[key: `tbar_${number}`]: number

	[key: `usk_${number}_${number}_input`]: string
	[key: `usk_${number}_${number}_input_id`]: number
	[key: `usk_${number}_${number}_maskEnabled`]: boolean | undefined
	[key: `usk_${number}_${number}_maskTop`]: number | undefined
	[key: `usk_${number}_${number}_maskBottom`]: number | undefined
	[key: `usk_${number}_${number}_maskLeft`]: number | undefined
	[key: `usk_${number}_${number}_maskRight`]: number | undefined
	[key: `usk_${number}_${number}_positionX`]: number | undefined
	[key: `usk_${number}_${number}_positionY`]: number | undefined
	[key: `usk_${number}_${number}_sizeX`]: number | undefined
	[key: `usk_${number}_${number}_sizeY`]: number | undefined
	[key: `usk_${number}_${number}_rotation`]: number | undefined
	[key: `usk_${number}_${number}_bordOutWidth`]: number | undefined
	[key: `usk_${number}_${number}_bordInWidth`]: number | undefined
	[key: `usk_${number}_${number}_bordOutSoft`]: number | undefined
	[key: `usk_${number}_${number}_bordInSoft`]: number | undefined
	[key: `usk_${number}_${number}_bevelSoft`]: number | undefined
	[key: `usk_${number}_${number}_bevelPos`]: number | undefined
	[key: `usk_${number}_${number}_bordOpacity`]: number | undefined
	[key: `usk_${number}_${number}_bordHue`]: number | undefined
	[key: `usk_${number}_${number}_bordLum`]: number | undefined
	[key: `usk_${number}_${number}_lightDirection`]: number | undefined
	[key: `usk_${number}_${number}_lightAltitude`]: number | undefined
	[key: `usk_${number}_${number}_bordEnabled`]: boolean | undefined
	[key: `usk_${number}_${number}_shadowEnabled`]: boolean | undefined
	[key: `usk_${number}_${number}_rate`]: number | undefined
	[key: `usk_${number}_${number}_pattern_style`]: number | undefined
	[key: `usk_${number}_${number}_pattern_size`]: number | undefined
	[key: `usk_${number}_${number}_pattern_symmetry`]: number | undefined
	[key: `usk_${number}_${number}_pattern_softness`]: number | undefined
	[key: `usk_${number}_${number}_pattern_positionX`]: number | undefined
	[key: `usk_${number}_${number}_pattern_positionY`]: number | undefined
	[key: `usk_${number}_${number}_pattern_invert`]: boolean | undefined
	[key: `usk_${number}_${number}_canFlyKey`]: boolean | undefined
	[key: `usk_${number}_${number}_flyEnabled`]: boolean | undefined

	[key: `aux${number}_input`]: string
	[key: `aux${number}_input_id`]: number

	[key: `dsk_${number}_input`]: string
	[key: `dsk_${number}_input_id`]: number

	[key: `long_${number}`]: string
	[key: `short_${number}`]: string

	[key: `macro_${number}`]: string

	[key: `still_${number}`]: string
	[key: `clip_${number}`]: string

	[key: `mp_source_${number}`]: string
	[key: `mp_index_${number}`]: string

	stream_bitrate?: string
	stream_duration_hm?: string
	stream_duration_hms?: string
	stream_duration_ms?: string
	stream_cache_used?: number

	record_duration_hm?: string
	record_duration_hms?: string
	record_duration_ms?: string
	record_remaining_hm?: string
	record_remaining_hms?: string
	record_remaining_ms?: string
	record_filename?: string

	[key: `ssrc${number}_box${number}_source`]: string
	[key: `ssrc${number}_box${number}_source_id`]: number
	[key: `ssrc${number}_box${number}_onair`]: boolean
	[key: `ssrc${number}_box${number}_size`]: number
	[key: `ssrc${number}_box${number}_x`]: number
	[key: `ssrc${number}_box${number}_y`]: number
	[key: `ssrc${number}_box${number}_cropEnable`]: boolean
	[key: `ssrc${number}_box${number}_cropTop`]: number
	[key: `ssrc${number}_box${number}_cropBottom`]: number
	[key: `ssrc${number}_box${number}_cropLeft`]: number
	[key: `ssrc${number}_box${number}_cropRight`]: number

	[key: `audio_input_${string}_balance`]: string | undefined
	[key: `audio_input_${string}_faderGain`]: string | undefined
	[key: `audio_input_${string}_framesDelay`]: string | undefined
	[key: `audio_input_${string}_gain`]: string | undefined
	[key: `audio_input_${string}_mixOption`]: string | undefined
	[key: `audio_input_${string}_left_balance`]: string | undefined
	[key: `audio_input_${string}_left_faderGain`]: string | undefined
	[key: `audio_input_${string}_left_framesDelay`]: string | undefined
	[key: `audio_input_${string}_left_gain`]: string | undefined
	[key: `audio_input_${string}_left_mixOption`]: string | undefined
	[key: `audio_input_${string}_right_balance`]: string | undefined
	[key: `audio_input_${string}_right_faderGain`]: string | undefined
	[key: `audio_input_${string}_right_framesDelay`]: string | undefined
	[key: `audio_input_${string}_right_gain`]: string | undefined
	[key: `audio_input_${string}_right_mixOption`]: string | undefined

	audio_master_faderGain?: string

	audio_monitor_gain?: string
	audio_monitor_master_gain?: string
	audio_monitor_talkback_gain?: string
	audio_monitor_sidetone_gain?: string

	[key: `audio_routing_destinations_${string}_name`]: string | undefined
	[key: `audio_routing_destinations_${string}_source`]: number | undefined
	[key: `audio_routing_destinations_${string}_source_name`]: string | undefined
	[key: `audio_routing_source_${string}_name`]: string | undefined

	[key: `mv_${number}_window_${number}_input`]: string
	[key: `mv_${number}_window_${number}_input_id`]: number

	[key: `camera_${number}_focus`]: number
	[key: `camera_${number}_iris`]: number
	[key: `camera_${number}_ois`]: number
	[key: `camera_${number}_wb_temp`]: number
	[key: `camera_${number}_wb_tint`]: number
	[key: `camera_${number}_exposure_us`]: number
	[key: `camera_${number}_sharpening`]: number
	[key: `camera_${number}_shutter_speed`]: number
	[key: `camera_${number}_gain`]: number
	[key: `camera_${number}_nd_filter`]: number
	[key: `camera_${number}_show_color_bars`]: 1 | 0
	[key: `camera_${number}_focus_assist`]: 1 | 0
	[key: `camera_${number}_false_color`]: 1 | 0
	[key: `camera_${number}_zebra`]: 1 | 0
	[key: `camera_${number}_status_overlay`]: 1 | 0
	[key: `camera_${number}_color_${string}_red`]: number
	[key: `camera_${number}_color_${string}_green`]: number
	[key: `camera_${number}_color_${string}_blue`]: number
	[key: `camera_${number}_color_${string}_luma`]: number
	[key: `camera_${number}_contrast_pivot`]: number
	[key: `camera_${number}_contrast_adjust`]: number
	[key: `camera_${number}_lumamix`]: number
	[key: `camera_${number}_hue_adjust`]: number
	[key: `camera_${number}_saturation_adjust`]: number

	timecode?: string
	display_clock?: string
}
