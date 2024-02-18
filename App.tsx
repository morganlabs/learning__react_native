// I apologise in advance, i barely read the docs and threw myself in head-first

import { useState } from 'react';
import { StyleSheet, Text, SafeAreaView, View, ListRenderItemInfo, Image, SectionList, SectionListData } from 'react-native';
import PickerSelect from 'react-native-picker-select';
import { songData, type SongInfo } from "./songData"

export default function App() {
    const disallowSortBy = ["art"]
    const pickerItems = Object.keys(songData[0])
        .filter((i) => !disallowSortBy.includes(i))
        .reverse()
        .map((i) => ({ label: i[0].toUpperCase() + i.slice(1), value: i }))
    const placeholder = pickerItems[0]
    pickerItems.shift()

    const [sortBy, setSortBy] = useState<keyof SongInfo>(placeholder.value as keyof SongInfo)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const songsInSections = generateSectionListFromSongData(songData, sortBy, sortOrder)

    return (
        <SafeAreaView style={styles.container}>
            <Text>Sort by...</Text>
            <View style={styles.sortByBar}>
                <PickerSelect
                    style={pickerSelectStyles}
                    onValueChange={setSortBy}
                    items={pickerItems}
                    placeholder={placeholder}
                ></PickerSelect>
                <PickerSelect
                    style={pickerSelectStyles}
                    onValueChange={setSortOrder}
                    items={[{ label: "Descending", value: "desc" }]}
                    placeholder={{ label: "Ascending", value: "asc" }}
                ></PickerSelect>
            </View>
            <SectionList<SongInfo>
                sections={songsInSections}
                renderItem={renderSong}
                renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
            >
            </SectionList>
        </SafeAreaView >
    );
}

function generateSectionListFromSongData(songData: SongInfo[], sortBy: keyof SongInfo, order: "asc" | "desc"): SectionListData<SongInfo>[] {
    const sorted = songData.sort((a, b) => sortSongData(a, b, sortBy, order))
    let sectionedSongs: SectionListData<SongInfo>[] = [];

    for (const song of sorted) {
        const sectionTitle: string = song[sortBy][0];
        const preexistingSectionIndex = sectionedSongs.findIndex((s) => s.title === sectionTitle)

        if (preexistingSectionIndex !== -1) {
            const section = sectionedSongs[preexistingSectionIndex];
            sectionedSongs[preexistingSectionIndex] = {
                ...section,
                data: [...section.data, song]
            }
        } else {
            sectionedSongs.push({ title: sectionTitle, data: [song] })
        }
    }

    sectionedSongs.map((s) => s.data = [...s.data].sort((a, b) => sortSongData(a, b, "title", "asc")))

    return sectionedSongs
}

function sortSongData(a: SongInfo, b: SongInfo, by: keyof SongInfo, order: "asc" | "desc"): number {
    switch (order) {
        case "asc":
            if (a[by] < b[by]) return -1
            else return 1
        case "desc":
            if (a[by] < b[by]) return 1
            else return -1
    }
}

function renderSong({ item: { title, artist, album, art } }: ListRenderItemInfo<SongInfo>) {
    const albumArtSize = 64;

    return <View style={styles.song}>
        <Image
            style={styles.albumArt}
            source={{ uri: art, width: albumArtSize, height: albumArtSize }}
        ></Image>
        <View style={styles.songInfo}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.artistAlbum}>{artist} - {album}</Text>
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fefefe',
    },

    picker: {
        padding: 8,
        borderWidth: 2
    },

    text: {
        color: '#121212',
    },

    sectionHeader: {
        fontWeight: "bold",
        fontSize: 24,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "#f0f0f0"
    },

    song: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },

    songInfo: {
        paddingLeft: 8
    },

    title: {
        fontSize: 16,
        fontWeight: "600"
    },

    artistAlbum: {
        opacity: 0.5
    },

    albumArt: {
        borderRadius: 4
    },

    sortByBar: {
        display: "flex",
        flexDirection: "row",
    }
});

const pickerSelectStyles = {
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
    },
};
