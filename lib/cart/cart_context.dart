import 'package:flutter/material.dart';

import 'cart_anchor.dart';
import 'cart_store.dart';

extension CartContext on BuildContext {
  CartStore get cart => CartInherited.of(this);
}
