"""Author Playroom hardware in Blender and export four named GLBs."""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector

OUT = Path("/Users/alexwoon/Documents/github/playroom/public/models")
OUT.mkdir(parents=True, exist_ok=True)

IVORY = (0.847, 0.796, 0.714, 1)
IVORY_DARK = (0.769, 0.706, 0.604, 1)
CHARCOAL = (0.169, 0.153, 0.141, 1)
SAGE = (0.490, 0.549, 0.451, 1)
SCREEN = (0.078, 0.102, 0.071, 1)
LED = (0.604, 0.227, 0.196, 1)
METAL = (0.541, 0.525, 0.502, 1)


def nuke_playroom():
    keep = {"Camera", "Light"}
    for obj in list(bpy.data.objects):
        if obj.name not in keep:
            bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    for mat in list(bpy.data.materials):
        if mat.users == 0:
            bpy.data.materials.remove(mat)
    for coll in list(bpy.data.collections):
        if coll.name.startswith("PR_"):
            bpy.data.collections.remove(coll)


def principled(name: str, color, rough=0.8, metal=0.03, emit=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = rough
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = metal
    emit_key = "Emission Color" if "Emission Color" in bsdf.inputs else "Emission"
    if emit_key in bsdf.inputs and emit:
        if emit_key == "Emission Color":
            bsdf.inputs["Emission Color"].default_value = color
            bsdf.inputs["Emission Strength"].default_value = emit
        else:
            bsdf.inputs["Emission"].default_value = color
    return mat


def link(obj, coll, parent=None):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    coll.objects.link(obj)
    if parent:
        obj.parent = parent


def box(name, dims, loc, mat, coll, parent, bevel=0.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        mod = ob.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        mod.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if ob.data.materials:
        ob.data.materials[0] = mat
    else:
        ob.data.materials.append(mat)
    link(ob, coll, parent)
    return ob


def plane(name, size, loc, rot, mat, coll, parent):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if ob.data.materials:
        ob.data.materials[0] = mat
    else:
        ob.data.materials.append(mat)
    link(ob, coll, parent)
    return ob


def cylinder(name, radius, depth, loc, rot, mat, coll, parent):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, location=loc, rotation=rot, vertices=20
    )
    ob = bpy.context.active_object
    ob.name = name
    if ob.data.materials:
        ob.data.materials[0] = mat
    else:
        ob.data.materials.append(mat)
    link(ob, coll, parent)
    return ob


def sphere(name, radius, loc, mat, coll, parent):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc, segments=16, ring_count=10)
    ob = bpy.context.active_object
    ob.name = name
    if ob.data.materials:
        ob.data.materials[0] = mat
    else:
        ob.data.materials.append(mat)
    link(ob, coll, parent)
    return ob


def empty(name, loc, coll, parent):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_size = 0.04
    ob.empty_display_type = "PLAIN_AXES"
    ob.location = loc
    link(ob, coll, parent)
    return ob


def root(name, coll):
    r = bpy.data.objects.new(name, None)
    r.empty_display_size = 0.08
    link(r, coll, None)
    return r


def export_root(obj, filename: str):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    for child in obj.children_recursive:
        child.select_set(True)
    bpy.context.view_layer.objects.active = obj
    path = str(OUT / filename)
    bpy.ops.export_scene.gltf(
        filepath=path,
        check_existing=False,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_cameras=False,
        export_extras=True,
        export_yup=True,
    )
    return path


def build():
    nuke_playroom()
    ivory = principled("IvoryPlastic", IVORY, 0.82)
    ivory_d = principled("IvoryDark", IVORY_DARK, 0.86)
    charcoal = principled("Charcoal", CHARCOAL, 0.5, 0.08)
    sage = principled("SageCart", SAGE, 0.78)
    screen = principled("CrtGlass", (0.02, 0.02, 0.02, 1), 0.28, 0.04, emit=0.05)
    led = principled("PowerLedMat", LED, 0.3, 0.0, emit=0.8)
    metal = principled("PortMetal", METAL, 0.35, 0.4)
    label = principled("LabelPanelMat", (0.937, 0.910, 0.863, 1), 0.55)

    # --- CRT (Panasonic CT-2005SB likeness) ---
    silver = principled("PanaSilver", (0.431, 0.447, 0.463, 1), 0.48, 0.08)
    silver_d = principled("PanaSilverDark", (0.31, 0.325, 0.341, 1), 0.55, 0.06)
    black = principled("PanaBezel", (0.102, 0.106, 0.114, 1), 0.42, 0.04)
    grille = principled("PanaGrille", (0.173, 0.18, 0.192, 1), 0.7)
    c_crt = bpy.data.collections.new("PR_CRT")
    bpy.context.scene.collection.children.link(c_crt)
    crt = root("Crt", c_crt)
    box("CrtBody", (0.98, 0.88, 0.9), (0, 0, 0), silver, c_crt, crt, 0.05)
    box("CrtRear", (0.78, 0.28, 0.7), (0, 0.52, -0.02), silver_d, c_crt, crt, 0.04)
    box("Bezel", (0.82, 0.06, 0.62), (0, -0.42, 0.1), black, c_crt, crt, 0.018)
    plane(
        "Screen",
        (0.64, 0.48),
        (0, -0.455, 0.1),
        (math.pi / 2, 0, 0),
        screen,
        c_crt,
        crt,
    )
    box("SpeakerBar", (0.94, 0.07, 0.18), (0, -0.42, -0.34), silver_d, c_crt, crt, 0.012)
    for i in range(14):
        x = -0.36 + i * 0.052
        box(f"Grille{i}", (0.038, 0.008, 0.11), (x, -0.458, -0.34), grille, c_crt, crt, 0)
    cylinder(
        "PowerKey",
        0.012,
        0.01,
        (0.4, -0.46, -0.34),
        (math.pi / 2, 0, 0),
        black,
        c_crt,
        crt,
    )
    box("Badge", (0.12, 0.004, 0.02), (0, -0.458, -0.34), black, c_crt, crt, 0)
    box("CrtFootL", (0.16, 0.2, 0.04), (-0.32, -0.12, -0.47), silver_d, c_crt, crt, 0.01)
    box("CrtFootR", (0.16, 0.2, 0.04), (0.32, -0.12, -0.47), silver_d, c_crt, crt, 0.01)
    box("CrtVents", (0.02, 0.4, 0.32), (0.5, 0.08, 0.02), black, c_crt, crt, 0)
    cylinder(
        "CrtJack",
        0.026,
        0.03,
        (-0.5, 0.18, -0.16),
        (0, math.pi / 2, 0),
        metal,
        c_crt,
        crt,
    )

    # --- Console ---
    c_con = bpy.data.collections.new("PR_Console")
    bpy.context.scene.collection.children.link(c_con)
    con = root("Console", c_con)
    box("ConsoleBody", (1.18, 0.74, 0.22), (0, 0, 0), ivory, c_con, con, 0.04)
    box("ConsoleDeck", (1.12, 0.58, 0.03), (0, 0.02, 0.11), ivory_d, c_con, con, 0.01)
    box("SlotWell", (0.16, 0.22, 0.08), (0.14, -0.02, 0.14), charcoal, c_con, con, 0.01)
    empty("CartridgeSlot", (0.14, -0.02, 0.2), c_con, con)
    sphere("PowerLed", 0.014, (-0.46, -0.28, 0.12), led, c_con, con)
    cylinder(
        "PortAv",
        0.026,
        0.02,
        (0.46, 0.38, 0.0),
        (math.pi / 2, 0, 0),
        metal,
        c_con,
        con,
    )
    cylinder(
        "PortController",
        0.026,
        0.02,
        (-0.08, -0.38, 0.0),
        (math.pi / 2, 0, 0),
        metal,
        c_con,
        con,
    )
    box("Door", (0.34, 0.28, 0.02), (-0.28, -0.02, 0.125), ivory, c_con, con, 0.008)

    # --- Controller ---
    c_pad = bpy.data.collections.new("PR_Controller")
    bpy.context.scene.collection.children.link(c_pad)
    pad = root("Controller", c_pad)
    box("PadBody", (0.46, 0.2, 0.065), (0, 0, 0), ivory, c_pad, pad, 0.02)
    dpad = bpy.data.objects.new("DPad", None)
    dpad.location = (-0.13, 0, 0.038)
    link(dpad, c_pad, pad)
    box("DPadH", (0.09, 0.032, 0.02), (0, 0, 0), charcoal, c_pad, dpad, 0.003)
    box("DPadV", (0.032, 0.09, 0.02), (0, 0, 0), charcoal, c_pad, dpad, 0.003)
    buttons = bpy.data.objects.new("Buttons", None)
    buttons.location = (0.14, -0.01, 0.04)
    link(buttons, c_pad, pad)
    cylinder("ButtonA", 0.018, 0.012, (0.028, -0.016, 0), (0, 0, 0), charcoal, c_pad, buttons)
    cylinder("ButtonB", 0.018, 0.012, (-0.02, 0.018, 0), (0, 0, 0), charcoal, c_pad, buttons)
    cylinder(
        "PadJack",
        0.018,
        0.03,
        (0, 0.11, 0.0),
        (math.pi / 2, 0, 0),
        metal,
        c_pad,
        pad,
    )

    # --- Cartridge ---
    c_cart = bpy.data.collections.new("PR_Cartridge")
    bpy.context.scene.collection.children.link(c_cart)
    cart = root("Cartridge", c_cart)
    box("CartBody", (0.12, 0.028, 0.168), (0, 0, 0), sage, c_cart, cart, 0.008)
    box("CartRidge", (0.126, 0.034, 0.018), (0, 0, 0.078), sage, c_cart, cart, 0.004)
    box("CartConnector", (0.09, 0.012, 0.028), (0, 0, -0.09), charcoal, c_cart, cart, 0)
    plane(
        "LabelPanel",
        (0.096, 0.112),
        (0, -0.015, 0.01),
        (math.pi / 2, 0, 0),
        label,
        c_cart,
        cart,
    )
    empty("MascotAnchor", (0, 0, 0.108), c_cart, cart)

    paths = {
        "crt": export_root(crt, "crt.glb"),
        "console": export_root(con, "console.glb"),
        "controller": export_root(pad, "controller.glb"),
        "cartridge": export_root(cart, "cartridge.glb"),
    }

    # Product-still in the viewport only; GLBs were exported at the origin.
    crt.location = (0.92, 0.18, 0.43)
    crt.rotation_euler = (0, 0, -0.42)
    con.location = (-0.78, -0.08, 0.11)
    con.rotation_euler = (0, 0, 0.18)
    pad.location = (0.16, -0.86, 0.033)
    pad.rotation_euler = (0, 0, 0.18)
    cart.location = (-0.64, -0.1, 0.31)
    cart.rotation_euler = (0, 0, 0.18)

    return paths


print(build())
